package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.HydrationStatsDTO;
import com.tecnocampus.backendtfg.application.dto.SleepStatsDTO;
import com.tecnocampus.backendtfg.application.dto.StatsDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.*;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public StatsService(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    private String getEmailFromToken(String token) {
        return jwtUtils.extractEmail(token);
    }

    public StatsDTO getActivityStats(String token) {
        return getActivityStats(token, "week");
    }

    public StatsDTO getActivityStats(String token, String period) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();

        if (!period.equalsIgnoreCase("week") && !period.equalsIgnoreCase("month")
                && !period.equalsIgnoreCase("year")) {
            throw new IllegalArgumentException("El período debe ser 'week', 'month' o 'year'");
        }

        // Calcular promedio de pasos diarios según período
        int averageSteps = calculateAverageSteps(activityProfile, period);

        // Calcular tendencia (comparando con el periodo anterior)
        String trend = calculateStepsTrend(activityProfile, period);

        // Determinar el mejor día (solo para week, para otros será el mejor día de la semana actual)
        String bestDay = determineBestDay(activityProfile);

        // Contar actividades totales
        int totalActivities = countActivities(activityProfile, period);

        // Calcular duración total por período
        int totalDuration = calculateTotalDuration(activityProfile, period);

        // Calcular calorías quemadas por período
        int caloriesBurned = calculateTotalCalories(activityProfile, period);

        return new StatsDTO(averageSteps, trend, bestDay, totalActivities, totalDuration, caloriesBurned);
    }

    private int calculateAverageSteps(ActivityProfile activityProfile, String period) {
        List<Integer> stepsValues;
        switch (period.toLowerCase()) {
            case "week":
                stepsValues = getWeeklyStepsValues(activityProfile);
                break;
            case "month":
                stepsValues = getMonthlyStepsValues(activityProfile);
                break;
            case "year":
                stepsValues = getYearlyStepsValues(activityProfile);
                break;
            default:
                throw new IllegalArgumentException("Período inválido");
        }
        if (stepsValues.isEmpty()) {
            return 0;
        }

        Calendar now = Calendar.getInstance();
        int daysToConsider;
        if (period.equalsIgnoreCase("week")) {
            int dow = now.get(Calendar.DAY_OF_WEEK);
            // Convertimos DAY_OF_WEEK en días transcurridos desde el lunes:
            // Monday=2 → 1, Tuesday=3 → 2, … Sunday=1 → 7
            daysToConsider = (dow == Calendar.SUNDAY)
                    ? 7
                    : (dow - Calendar.MONDAY + 1);
        } else {
            daysToConsider = stepsValues.size();
        }
        // Sumamos solo los pasos de esos días
        int total = 0;
        for (int i = 0; i < Math.min(daysToConsider, stepsValues.size()); i++) {
            total += stepsValues.get(i);
        }
        // División entera tras acumular correctamente
        return total / daysToConsider;
    }

    private String calculateStepsTrend(ActivityProfile activityProfile, String period) {
        List<Integer> current = switch (period.toLowerCase()) {
            case "week"  -> getWeeklyStepsValues(activityProfile);
            case "month" -> getMonthlyStepsValues(activityProfile);
            case "year"  -> getYearlyStepsValues(activityProfile);
            default      -> getWeeklyStepsValues(activityProfile);
        };
        List<Integer> previous = switch (period.toLowerCase()) {
            case "week"  -> getLastWeekStepsValues(activityProfile);
            case "month" -> getPreviousMonthStepsValues(activityProfile);
            case "year"  -> getPreviousYearStepsValues(activityProfile);
            default      -> getLastWeekStepsValues(activityProfile);
        };

        int curTotal  = current.stream().mapToInt(Integer::intValue).sum();
        int prevTotal = previous.stream().mapToInt(Integer::intValue).sum();

        if (prevTotal < 1000) {
            return "+0%";
        }

        double raw = ((double)(curTotal - prevTotal) / prevTotal) * 100;
        int pct  = (int) Math.round(raw);
        // limitar rangos
        pct = Math.max(-95, Math.min(pct, 95));

        return (pct >= 0 ? "+" : "") + pct + "%";
    }

    private int countActivities(ActivityProfile activityProfile, String period) {
        Calendar cal = Calendar.getInstance();
        switch (period.toLowerCase()) {
            case "week": {
                int dow = cal.get(Calendar.DAY_OF_WEEK);
                int back = (dow == Calendar.SUNDAY) ? 6 : (dow - Calendar.MONDAY);
                cal.add(Calendar.DAY_OF_MONTH, -back);
                break;
            }
            case "month":
                cal.set(Calendar.DAY_OF_MONTH, 1);
                break;
            case "year":
                cal.set(Calendar.MONTH, Calendar.JANUARY);
                cal.set(Calendar.DAY_OF_MONTH, 1);
                break;
        }
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startDate = cal.getTime();

        int count = 0;
        for (AbstractActivity a : activityProfile.getActivities()) {
            if (!a.getDate().before(startDate)) count++;
        }
        return count;
    }

    private int calculateTotalDuration(ActivityProfile activityProfile, String period) {
        Calendar cal = Calendar.getInstance();
        switch (period.toLowerCase()) {
            case "week": {
                int dow = cal.get(Calendar.DAY_OF_WEEK);
                int back = (dow == Calendar.SUNDAY) ? 6 : (dow - Calendar.MONDAY);
                cal.add(Calendar.DAY_OF_MONTH, -back);
                break;
            }
            case "month":
                cal.set(Calendar.DAY_OF_MONTH, 1);
                break;
            case "year":
                cal.set(Calendar.MONTH, Calendar.JANUARY);
                cal.set(Calendar.DAY_OF_MONTH, 1);
                break;
        }
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startDate = cal.getTime();

        int totalDuration = 0;
        for (AbstractActivity a : activityProfile.getActivities()) {
            if (!a.getDate().before(startDate)) {
                totalDuration += (int) a.getDuration();
            }
        }
        return totalDuration;
    }

    private int calculateTotalCalories(ActivityProfile activityProfile, String period) {
        Calendar cal = Calendar.getInstance();
        switch (period.toLowerCase()) {
            case "week": {
                int dow = cal.get(Calendar.DAY_OF_WEEK);
                int back = (dow == Calendar.SUNDAY) ? 6 : (dow - Calendar.MONDAY);
                cal.add(Calendar.DAY_OF_MONTH, -back);
                break;
            }
            case "month":
                cal.set(Calendar.DAY_OF_MONTH, 1);
                break;
            case "year":
                cal.set(Calendar.MONTH, Calendar.JANUARY);
                cal.set(Calendar.DAY_OF_MONTH, 1);
                break;
        }
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startDate = cal.getTime();

        int totalCalories = 0;
        for (AbstractActivity a : activityProfile.getActivities()) {
            if (!a.getDate().before(startDate)) {
                totalCalories += (int) a.getCaloriesBurned();
            }
        }
        return totalCalories;
    }

    private String determineBestDay(ActivityProfile activityProfile) {
        List<Integer> weeklySteps = getWeeklyStepsValues(activityProfile);

        int maxSteps = 0;
        int bestDayIndex = 0;

        for (int i = 0; i < weeklySteps.size(); i++) {
            if (weeklySteps.get(i) > maxSteps) {
                maxSteps = weeklySteps.get(i);
                bestDayIndex = i;
            }
        }

        // Convertir índice a nombre del día
        String[] dayNames = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        return dayNames[bestDayIndex];
    }
    private List<Integer> getLastWeekStepsValues(ActivityProfile activityProfile) {
        Calendar cal = Calendar.getInstance();
        // 1) Mover al lunes de la semana actual
        int dow = cal.get(Calendar.DAY_OF_WEEK);
        int backToMonday = (dow == Calendar.SUNDAY)
                ? 6
                : (dow - Calendar.MONDAY);
        cal.add(Calendar.DAY_OF_MONTH, -backToMonday);
        // 2) Retroceder 7 días: queda ya en lunes de la semana anterior
        cal.add(Calendar.DAY_OF_MONTH, -7);
        // 3) Limpiar hora/min/seg/millis
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startOfLastWeek = cal.getTime();

        // 4) Avanzar a domingo 23:59:59.999
        cal.add(Calendar.DAY_OF_MONTH, 6);
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        cal.set(Calendar.MILLISECOND, 999);
        Date endOfLastWeek = cal.getTime();

        // 5) Agregar pasos
        List<Integer> values = Arrays.asList(0,0,0,0,0,0,0);
        for (DailySteps ds : activityProfile.getDailySteps()) {
            Date d = ds.getDate();
            if (!d.before(startOfLastWeek) && !d.after(endOfLastWeek)) {
                Calendar c = Calendar.getInstance();
                c.setTime(d);
                int idx = (c.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY)
                        ? 6
                        : (c.get(Calendar.DAY_OF_WEEK) - Calendar.MONDAY);
                values.set(idx, values.get(idx) + ds.getSteps());
            }
        }
        return values;
    }


    private List<Integer> getWeeklyStepsValues(ActivityProfile activityProfile) {
        Calendar calendar = Calendar.getInstance();

        // Retroceder al lunes de la semana actual
        int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
        int daysToSubtract = (dayOfWeek == Calendar.SUNDAY) ? 6 : dayOfWeek - Calendar.MONDAY;
        calendar.add(Calendar.DAY_OF_MONTH, -daysToSubtract);

        // Establecer a 00:00:00
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        Date startOfWeek = calendar.getTime();

        // Calcular fin de semana (domingo 23:59:59)
        calendar.add(Calendar.DAY_OF_MONTH, 6);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfWeek = calendar.getTime();

        // Inicializar valores para cada día de la semana con 0
        List<Integer> values = Arrays.asList(0, 0, 0, 0, 0, 0, 0);

        for (DailySteps dailySteps : activityProfile.getDailySteps()) {
            Date stepsDate = dailySteps.getDate();
            if (!stepsDate.before(startOfWeek) && !stepsDate.after(endOfWeek)) {
                Calendar stepsCal = Calendar.getInstance();
                stepsCal.setTime(stepsDate);
                int dayOfWeekSteps = stepsCal.get(Calendar.DAY_OF_WEEK);
                int index = dayOfWeekSteps == Calendar.SUNDAY ? 6 : dayOfWeekSteps - Calendar.MONDAY;
                values.set(index, values.get(index) + dailySteps.getSteps());
            }
        }

        return values;
    }

    private List<Integer> getMonthlyStepsValues(ActivityProfile activityProfile) {
        Calendar calendar = Calendar.getInstance();

        // Inicio del mes actual (día 1 a las 00:00:00)
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        Date startOfMonth = calendar.getTime();

        // Fin del mes (último día a las 23:59:59)
        int lastDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        calendar.set(Calendar.DAY_OF_MONTH, lastDay);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);

        Date endOfMonth = calendar.getTime();

        // Inicializar valores para cada día del mes
        List<Integer> values = new ArrayList<>();
        for (int i = 0; i < lastDay; i++) {
            values.add(0);
        }

        for (DailySteps dailySteps : activityProfile.getDailySteps()) {
            Date stepsDate = dailySteps.getDate();
            if (!stepsDate.before(startOfMonth) && !stepsDate.after(endOfMonth)) {
                Calendar stepsCal = Calendar.getInstance();
                stepsCal.setTime(stepsDate);
                int dayOfMonth = stepsCal.get(Calendar.DAY_OF_MONTH);
                values.set(dayOfMonth - 1, values.get(dayOfMonth - 1) + dailySteps.getSteps());
            }
        }

        return values;
    }

    private List<Integer> getPreviousMonthStepsValues(ActivityProfile activityProfile) {
        Calendar calendar = Calendar.getInstance();

        // Retroceder al mes anterior
        calendar.add(Calendar.MONTH, -1);

        // Inicio del mes anterior (día 1 a las 00:00:00)
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        Date startOfPreviousMonth = calendar.getTime();

        // Fin del mes anterior (último día a las 23:59:59)
        int lastDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        calendar.set(Calendar.DAY_OF_MONTH, lastDay);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);

        Date endOfPreviousMonth = calendar.getTime();

        // Inicializar valores para cada día del mes anterior
        List<Integer> values = new ArrayList<>();
        for (int i = 0; i < lastDay; i++) {
            values.add(0);
        }

        for (DailySteps dailySteps : activityProfile.getDailySteps()) {
            Date stepsDate = dailySteps.getDate();
            if (!stepsDate.before(startOfPreviousMonth) && !stepsDate.after(endOfPreviousMonth)) {
                Calendar stepsCal = Calendar.getInstance();
                stepsCal.setTime(stepsDate);
                int dayOfMonth = stepsCal.get(Calendar.DAY_OF_MONTH);
                values.set(dayOfMonth - 1, values.get(dayOfMonth - 1) + dailySteps.getSteps());
            }
        }

        return values;
    }

    private List<Integer> getYearlyStepsValues(ActivityProfile activityProfile) {
        Calendar calendar = Calendar.getInstance();
        int currentYear = calendar.get(Calendar.YEAR);

        // Establecer inicio del año (1 de enero a las 00:00:00)
        calendar.set(Calendar.YEAR, currentYear);
        calendar.set(Calendar.MONTH, Calendar.JANUARY);
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        Date startOfYear = calendar.getTime();

        // Establecer fin del año (31 de diciembre a las 23:59:59)
        calendar.set(Calendar.MONTH, Calendar.DECEMBER);
        calendar.set(Calendar.DAY_OF_MONTH, 31);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);

        Date endOfYear = calendar.getTime();

        List<Integer> values = new ArrayList<>(Arrays.asList(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));

        for (DailySteps dailySteps : activityProfile.getDailySteps()) {
            Date stepsDate = dailySteps.getDate();
            if (!stepsDate.before(startOfYear) && !stepsDate.after(endOfYear)) {
                Calendar stepsCal = Calendar.getInstance();
                stepsCal.setTime(stepsDate);
                int month = stepsCal.get(Calendar.MONTH);
                values.set(month, values.get(month) + dailySteps.getSteps());
            }
        }

        return values;
    }

    private List<Integer> getPreviousYearStepsValues(ActivityProfile activityProfile) {
        Calendar calendar = Calendar.getInstance();
        int previousYear = calendar.get(Calendar.YEAR) - 1;

        // Establecer inicio del año anterior (1 de enero a las 00:00:00)
        calendar.set(Calendar.YEAR, previousYear);
        calendar.set(Calendar.MONTH, Calendar.JANUARY);
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        Date startOfPreviousYear = calendar.getTime();

        // Establecer fin del año anterior (31 de diciembre a las 23:59:59)
        calendar.set(Calendar.MONTH, Calendar.DECEMBER);
        calendar.set(Calendar.DAY_OF_MONTH, 31);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);

        Date endOfPreviousYear = calendar.getTime();

        List<Integer> values = new ArrayList<>(Arrays.asList(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));

        for (DailySteps dailySteps : activityProfile.getDailySteps()) {
            Date stepsDate = dailySteps.getDate();
            if (!stepsDate.before(startOfPreviousYear) && !stepsDate.after(endOfPreviousYear)) {
                Calendar stepsCal = Calendar.getInstance();
                stepsCal.setTime(stepsDate);
                int month = stepsCal.get(Calendar.MONTH);
                values.set(month, values.get(month) + dailySteps.getSteps());
            }
        }

        return values;
    }

    public SleepStatsDTO getSleepStats(String token) {
        // 1. Extraer usuario
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);
        List<Sleep> sleeps = user.getSleepProfile().getSleeps();

        if (sleeps.isEmpty()) {
            // Devuelve un DTO con ceros si no hay datos
            return new SleepStatsDTO(0.0, 0.0, 0, "", "", "00:00", "00:00");
        }

        int n = sleeps.size();

        // 2. Media de horas de sueño
        double totalHours = sleeps.stream()
                .mapToDouble(Sleep::getHours)
                .sum();
        double averageDuration = Math.round((totalHours / n) * 10) / 10.0;

        // 3. Media de calidad
        double totalQuality = sleeps.stream()
                .mapToInt(Sleep::getQuality)
                .sum();
        double averageQuality = Math.round((totalQuality / n) * 10) / 10.0;

        // 4. Media de REM
        int totalRem = sleeps.stream()
                .mapToInt(Sleep::getRemSleep)
                .sum();
        int averageRem = (int) Math.round((double) totalRem / n);

        // 5. Mejor y peor día (por día de la semana de endTime)
        Map<DayOfWeek, List<Double>> byDay = new EnumMap<>(DayOfWeek.class);
        for (Sleep s : sleeps) {
            Instant inst = s.getEndTime().toInstant();
            DayOfWeek dow = inst.atZone(ZoneId.systemDefault()).getDayOfWeek();
            byDay.computeIfAbsent(dow, d -> new ArrayList<>()).add(s.getHours());
        }
        // Calcular media por día
        Map<DayOfWeek, Double> avgByDay = new EnumMap<>(DayOfWeek.class);
        byDay.forEach((dow, list) -> {
            double sum = list.stream().mapToDouble(Double::doubleValue).sum();
            avgByDay.put(dow, sum / list.size());
        });
        DayOfWeek bestDow = Collections.max(avgByDay.entrySet(),
                Map.Entry.comparingByValue()).getKey();
        DayOfWeek worstDow = Collections.min(avgByDay.entrySet(),
                Map.Entry.comparingByValue()).getKey();
        String[] dias = {"Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"};
        String bestSleepDay = dias[bestDow.getValue() - 1];
        String worstSleepDay = dias[worstDow.getValue() - 1];

        // 6. Hora media de acostarse (startTime), con wrap‑around
        int totalBedMins = 0;
        for (Sleep s : sleeps) {
            LocalTime t = s.getStartTime().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalTime();
            int mins = t.getHour() * 60 + t.getMinute();
            if (mins < 12 * 60) mins += 24 * 60;
            totalBedMins += mins;
        }
        int avgBed = totalBedMins / n;
        if (avgBed >= 24 * 60) avgBed -= 24 * 60;
        String averageBedtime = String.format("%02d:%02d", avgBed / 60, avgBed % 60);

        // 7. Hora media de despertar (endTime)
        int totalWakeMins = sleeps.stream()
                .mapToInt(s -> {
                    LocalTime t = s.getEndTime().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalTime();
                    return t.getHour() * 60 + t.getMinute();
                })
                .sum();
        int avgWake = totalWakeMins / n;
        String averageWakeTime = String.format("%02d:%02d", avgWake / 60, avgWake % 60);

        // 8. Devolver DTO
        return new SleepStatsDTO(
                averageDuration,
                averageQuality,
                averageRem,
                bestSleepDay,
                worstSleepDay,
                averageBedtime,
                averageWakeTime
        );
    }

    public SleepStatsDTO getSleepStats(String token, String period) {
        // 1. Extraer usuario y sleeps
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);
        List<Sleep> allSleeps = user.getSleepProfile().getSleeps();

        // 2. Validar periodo
        if (!Arrays.asList("week","month","year").contains(period.toLowerCase())) {
            throw new IllegalArgumentException("Período inválido: debe ser week, month o year");
        }

        // 3. Calcular startDate según periodo
        Calendar cal = Calendar.getInstance();
        switch (period.toLowerCase()) {
            case "week": {
                int dow = cal.get(Calendar.DAY_OF_WEEK);
                int back = (dow == Calendar.SUNDAY) ? 6 : (dow - Calendar.MONDAY);
                cal.add(Calendar.DAY_OF_MONTH, -back);
                break;
            }
            case "month":
                cal.set(Calendar.DAY_OF_MONTH, 1);
                break;
            case "year":
                cal.set(Calendar.MONTH, Calendar.JANUARY);
                cal.set(Calendar.DAY_OF_MONTH, 1);
                break;
        }
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startDate = cal.getTime();

        // 4. Filtrar sleeps cuyo endTime >= startDate
        List<Sleep> sleeps = allSleeps.stream()
                .filter(s -> !s.getEndTime().before(startDate))
                .collect(Collectors.toList());

        // 5. Si no hay datos, devolver ceros
        if (sleeps.isEmpty()) {
            return new SleepStatsDTO(0.0, 0.0, 0, "", "", "00:00", "00:00");
        }

        int n = sleeps.size();

        // 6. Media de horas de sueño
        double totalHours = sleeps.stream()
                .mapToDouble(Sleep::getHours)
                .sum();
        double avgDuration = Math.round((totalHours / n) * 10) / 10.0;

        // 7. Media de calidad
        double totalQuality = sleeps.stream()
                .mapToInt(Sleep::getQuality)
                .sum();
        double avgQuality = Math.round((totalQuality / n) * 10) / 10.0;

        // 8. Media de REM
        int totalRem = sleeps.stream()
                .mapToInt(Sleep::getRemSleep)
                .sum();
        int avgRem = (int) Math.round((double) totalRem / n);

        // 9. Mejor y peor día (por día de la semana de endTime)
        Map<DayOfWeek, List<Double>> byDay = new EnumMap<>(DayOfWeek.class);
        for (Sleep s : sleeps) {
            DayOfWeek dow = s.getEndTime().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .getDayOfWeek();
            byDay.computeIfAbsent(dow, d -> new ArrayList<>()).add(s.getHours());
        }
        Map<DayOfWeek, Double> avgByDay = new EnumMap<>(DayOfWeek.class);
        byDay.forEach((dow, list) -> {
            double sum = list.stream().mapToDouble(Double::doubleValue).sum();
            avgByDay.put(dow, sum / list.size());
        });
        DayOfWeek bestDow = Collections.max(avgByDay.entrySet(), Map.Entry.comparingByValue()).getKey();
        DayOfWeek worstDow = Collections.min(avgByDay.entrySet(), Map.Entry.comparingByValue()).getKey();
        String[] dias = {"Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"};
        String bestSleepDay = dias[bestDow.getValue() - 1];
        String worstSleepDay = dias[worstDow.getValue() - 1];

        // 10. Media de hora de acostarse (startTime) con wrap‑around
        int totalBedMins = 0;
        for (Sleep s : sleeps) {
            LocalTime t = s.getStartTime().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalTime();
            int mins = t.getHour() * 60 + t.getMinute();
            if (mins < 12 * 60) mins += 24 * 60;
            totalBedMins += mins;
        }
        int avgBed = totalBedMins / n;
        if (avgBed >= 24 * 60) avgBed -= 24 * 60;
        String averageBedtime = String.format("%02d:%02d", avgBed / 60, avgBed % 60);

        // 11. Media de hora de despertar (endTime)
        int totalWakeMins = sleeps.stream()
                .mapToInt(s -> {
                    LocalTime t = s.getEndTime().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalTime();
                    return t.getHour() * 60 + t.getMinute();
                })
                .sum();
        int avgWake = totalWakeMins / n;
        String averageWakeTime = String.format("%02d:%02d", avgWake / 60, avgWake % 60);

        // 12. Devolver DTO
        return new SleepStatsDTO(
                avgDuration,
                avgQuality,
                avgRem,
                bestSleepDay,
                worstSleepDay,
                averageBedtime,
                averageWakeTime
        );
    }

    public HydrationStatsDTO getHydrationStats(String token) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        HydrationProfile hydrationProfile = user.getHydrationProfile();

        // Calcular consumo de hoy
        Calendar today = Calendar.getInstance();
        today.set(Calendar.HOUR_OF_DAY, 0);
        today.set(Calendar.MINUTE, 0);
        today.set(Calendar.SECOND, 0);
        today.set(Calendar.MILLISECOND, 0);
        Date startOfToday = today.getTime();

        today.set(Calendar.HOUR_OF_DAY, 23);
        today.set(Calendar.MINUTE, 59);
        today.set(Calendar.SECOND, 59);
        Date endOfToday = today.getTime();

        int todayConsumption = 0;
        for (Hydration hydration : hydrationProfile.getHydrations()) {
            Date hydrationDate = hydration.getDate();
            if (!hydrationDate.before(startOfToday) && !hydrationDate.after(endOfToday)) {
                todayConsumption += (int)(hydration.getQuantity() * 1000);
            }
        }

        // Calcular consumo de ayer
        Calendar yesterday = Calendar.getInstance();
        yesterday.add(Calendar.DAY_OF_MONTH, -1);
        yesterday.set(Calendar.HOUR_OF_DAY, 0);
        yesterday.set(Calendar.MINUTE, 0);
        yesterday.set(Calendar.SECOND, 0);
        yesterday.set(Calendar.MILLISECOND, 0);
        Date startOfYesterday = yesterday.getTime();

        yesterday.set(Calendar.HOUR_OF_DAY, 23);
        yesterday.set(Calendar.MINUTE, 59);
        yesterday.set(Calendar.SECOND, 59);
        Date endOfYesterday = yesterday.getTime();

        int yesterdayConsumption = 0;
        for (Hydration hydration : hydrationProfile.getHydrations()) {
            Date hydrationDate = hydration.getDate();
            if (!hydrationDate.before(startOfYesterday) && !hydrationDate.after(endOfYesterday)) {
                yesterdayConsumption += (int)(hydration.getQuantity() * 1000);
            }
        }

        // Calcular promedio semanal
        int weekAverage = calculateWeekAverage(hydrationProfile);

        // Calcular promedio mensual
        int monthAverage = calculateMonthAverage(hydrationProfile);

        // Calcular objetivo diario
        int objective = (int) (hydrationProfile.getDailyObjectiveWater() * 1000);

        // Calcular porcentaje alcanzado hoy
        int percentageToday = objective > 0 ? Math.min(100, (todayConsumption * 100) / objective) : 0;

        // Calcular racha
        int streak = calculateStreak(hydrationProfile, objective, todayConsumption);

        return new HydrationStatsDTO(
                todayConsumption,
                yesterdayConsumption,
                weekAverage,
                monthAverage,
                objective,
                percentageToday,
                streak
        );
    }

    private int calculateWeekAverage(HydrationProfile profile) {
        Calendar weekStart = Calendar.getInstance();
        int dayOfWeek = weekStart.get(Calendar.DAY_OF_WEEK);
        int daysToSubtract = (dayOfWeek == Calendar.SUNDAY) ? 6 : dayOfWeek - Calendar.MONDAY;
        weekStart.add(Calendar.DAY_OF_MONTH, -daysToSubtract);
        weekStart.set(Calendar.HOUR_OF_DAY, 0);
        weekStart.set(Calendar.MINUTE, 0);
        weekStart.set(Calendar.SECOND, 0);
        weekStart.set(Calendar.MILLISECOND, 0);
        Date startOfWeek = weekStart.getTime();

        int weekTotal = 0;
        int weekDays = 0;

        Calendar day = (Calendar) weekStart.clone();
        Calendar now = Calendar.getInstance();

        while (!day.after(now)) {
            Date dayStart = day.getTime();
            day.set(Calendar.HOUR_OF_DAY, 23);
            day.set(Calendar.MINUTE, 59);
            day.set(Calendar.SECOND, 59);
            Date dayEnd = day.getTime();

            int dayTotal = 0;
            for (Hydration hydration : profile.getHydrations()) {
                Date hydrationDate = hydration.getDate();
                if (!hydrationDate.before(dayStart) && !hydrationDate.after(dayEnd)) {
                    dayTotal += (int)(hydration.getQuantity() * 1000);
                }
            }

            if (dayTotal > 0) {
                weekTotal += dayTotal;
                weekDays++;
            }

            day.add(Calendar.DAY_OF_MONTH, 1);
            day.set(Calendar.HOUR_OF_DAY, 0);
            day.set(Calendar.MINUTE, 0);
            day.set(Calendar.SECOND, 0);
        }

        return weekDays > 0 ? weekTotal / weekDays : 0;
    }

    private int calculateMonthAverage(HydrationProfile profile) {
        Calendar monthStart = Calendar.getInstance();
        monthStart.set(Calendar.DAY_OF_MONTH, 1);
        monthStart.set(Calendar.HOUR_OF_DAY, 0);
        monthStart.set(Calendar.MINUTE, 0);
        monthStart.set(Calendar.SECOND, 0);
        monthStart.set(Calendar.MILLISECOND, 0);
        Date startOfMonth = monthStart.getTime();

        int monthTotal = 0;
        int monthDays = 0;

        Calendar day = (Calendar) monthStart.clone();
        Calendar now = Calendar.getInstance();

        while (!day.after(now)) {
            Date dayStart = day.getTime();
            day.set(Calendar.HOUR_OF_DAY, 23);
            day.set(Calendar.MINUTE, 59);
            day.set(Calendar.SECOND, 59);
            Date dayEnd = day.getTime();

            int dayTotal = 0;
            for (Hydration hydration : profile.getHydrations()) {
                Date hydrationDate = hydration.getDate();
                if (!hydrationDate.before(dayStart) && !hydrationDate.after(dayEnd)) {
                    dayTotal += (int)(hydration.getQuantity() * 1000);
                }
            }

            if (dayTotal > 0) {
                monthTotal += dayTotal;
                monthDays++;
            }

            day.add(Calendar.DAY_OF_MONTH, 1);
            day.set(Calendar.HOUR_OF_DAY, 0);
            day.set(Calendar.MINUTE, 0);
            day.set(Calendar.SECOND, 0);
        }

        return monthDays > 0 ? monthTotal / monthDays : 0;
    }

    private int calculateStreak(HydrationProfile profile, int objective, int todayConsumption) {
        // Definimos un umbral (30% del objetivo) para considerar el día como válido
        int threshold = (int)(objective * 0.3);

        int streak = 0;
        Calendar checkDay = Calendar.getInstance();
        checkDay.add(Calendar.DAY_OF_MONTH, -1); // Empezar desde ayer

        boolean streakBroken = false;
        while (!streakBroken) {
            checkDay.set(Calendar.HOUR_OF_DAY, 0);
            checkDay.set(Calendar.MINUTE, 0);
            checkDay.set(Calendar.SECOND, 0);
            checkDay.set(Calendar.MILLISECOND, 0);
            Date dayStart = checkDay.getTime();

            checkDay.set(Calendar.HOUR_OF_DAY, 23);
            checkDay.set(Calendar.MINUTE, 59);
            checkDay.set(Calendar.SECOND, 59);
            Date dayEnd = checkDay.getTime();

            int dayTotal = 0;
            for (Hydration hydration : profile.getHydrations()) {
                Date hydrationDate = hydration.getDate();
                if (!hydrationDate.before(dayStart) && !hydrationDate.after(dayEnd)) {
                    dayTotal += (int)(hydration.getQuantity() * 1000);
                }
            }

            // Usamos el umbral en lugar del objetivo completo
            if (dayTotal < threshold) {
                streakBroken = true;
            } else {
                streak++;
                checkDay.add(Calendar.DAY_OF_MONTH, -1);
            }
        }

        // También usamos el umbral para hoy
        if (todayConsumption >= threshold) {
            streak++;
        }

        return streak;
    }

    public HydrationStatsDTO getHydrationStats(String token, String period) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        HydrationProfile hydrationProfile = user.getHydrationProfile();

        // Validar el periodo
        if (!period.equalsIgnoreCase("week") && !period.equalsIgnoreCase("month")
                && !period.equalsIgnoreCase("year")) {
            throw new IllegalArgumentException("El período debe ser 'week', 'month' o 'year'");
        }

        // Calcular la fecha de inicio según el periodo
        Calendar periodStart = Calendar.getInstance();
        switch (period.toLowerCase()) {
            case "week":
                int dayOfWeek = periodStart.get(Calendar.DAY_OF_WEEK);
                int daysToSubtract = (dayOfWeek == Calendar.SUNDAY) ? 6 : dayOfWeek - Calendar.MONDAY;
                periodStart.add(Calendar.DAY_OF_MONTH, -daysToSubtract);
                break;
            case "month":
                periodStart.set(Calendar.DAY_OF_MONTH, 1);
                break;
            case "year":
                periodStart.set(Calendar.MONTH, Calendar.JANUARY);
                periodStart.set(Calendar.DAY_OF_MONTH, 1);
                break;
        }
        periodStart.set(Calendar.HOUR_OF_DAY, 0);
        periodStart.set(Calendar.MINUTE, 0);
        periodStart.set(Calendar.SECOND, 0);
        periodStart.set(Calendar.MILLISECOND, 0);
        Date startDate = periodStart.getTime();

        // Filtrar las hidrataciones del periodo
        List<Hydration> periodHydrations = hydrationProfile.getHydrations().stream()
                .filter(h -> !h.getDate().before(startDate))
                .collect(Collectors.toList());

        // Calcular consumo de hoy
        Calendar today = Calendar.getInstance();
        today.set(Calendar.HOUR_OF_DAY, 0);
        today.set(Calendar.MINUTE, 0);
        today.set(Calendar.SECOND, 0);
        today.set(Calendar.MILLISECOND, 0);
        Date startOfToday = today.getTime();

        today.set(Calendar.HOUR_OF_DAY, 23);
        today.set(Calendar.MINUTE, 59);
        today.set(Calendar.SECOND, 59);
        Date endOfToday = today.getTime();

        int todayConsumption = 0;
        for (Hydration hydration : periodHydrations) {
            Date hydrationDate = hydration.getDate();
            if (!hydrationDate.before(startOfToday) && !hydrationDate.after(endOfToday)) {
                todayConsumption += (int)(hydration.getQuantity() * 1000);
            }
        }

        // Calcular consumo de ayer
        Calendar yesterday = Calendar.getInstance();
        yesterday.add(Calendar.DAY_OF_MONTH, -1);
        yesterday.set(Calendar.HOUR_OF_DAY, 0);
        yesterday.set(Calendar.MINUTE, 0);
        yesterday.set(Calendar.SECOND, 0);
        yesterday.set(Calendar.MILLISECOND, 0);
        Date startOfYesterday = yesterday.getTime();

        yesterday.set(Calendar.HOUR_OF_DAY, 23);
        yesterday.set(Calendar.MINUTE, 59);
        yesterday.set(Calendar.SECOND, 59);
        Date endOfYesterday = yesterday.getTime();

        int yesterdayConsumption = 0;
        for (Hydration hydration : periodHydrations) {
            Date hydrationDate = hydration.getDate();
            if (!hydrationDate.before(startOfYesterday) && !hydrationDate.after(endOfYesterday)) {
                yesterdayConsumption += (int)(hydration.getQuantity() * 1000);
            }
        }

        // Calcular promedio semanal y mensual con las hidrataciones del periodo
        int weekAverage = calculateWeekAverageForPeriod(periodHydrations, startDate);
        int monthAverage = calculateMonthAverageForPeriod(periodHydrations, startDate);

        // Calcular objetivo diario
        int objective = (int) (hydrationProfile.getDailyObjectiveWater() * 1000);

        // Calcular porcentaje alcanzado hoy
        int percentageToday = objective > 0 ? Math.min(100, (todayConsumption * 100) / objective) : 0;

        // Calcular racha con las hidrataciones del periodo
        int streak = calculateStreakForPeriod(periodHydrations, objective, todayConsumption);

        return new HydrationStatsDTO(
                todayConsumption,
                yesterdayConsumption,
                weekAverage,
                monthAverage,
                objective,
                percentageToday,
                streak
        );
    }

    private int calculateWeekAverageForPeriod(List<Hydration> hydrations, Date periodStart) {
        Calendar weekStart = Calendar.getInstance();
        int dayOfWeek = weekStart.get(Calendar.DAY_OF_WEEK);
        int daysToSubtract = (dayOfWeek == Calendar.SUNDAY) ? 6 : dayOfWeek - Calendar.MONDAY;
        weekStart.add(Calendar.DAY_OF_MONTH, -daysToSubtract);
        weekStart.set(Calendar.HOUR_OF_DAY, 0);
        weekStart.set(Calendar.MINUTE, 0);
        weekStart.set(Calendar.SECOND, 0);
        weekStart.set(Calendar.MILLISECOND, 0);
        Date startOfWeek = weekStart.getTime();
        startOfWeek = startOfWeek.before(periodStart) ? periodStart : startOfWeek;

        int weekTotal = 0;
        int weekDays = 0;

        Calendar day = (Calendar) weekStart.clone();
        Calendar now = Calendar.getInstance();

        while (!day.after(now)) {
            Date dayStart = day.getTime();
            day.set(Calendar.HOUR_OF_DAY, 23);
            day.set(Calendar.MINUTE, 59);
            day.set(Calendar.SECOND, 59);
            Date dayEnd = day.getTime();

            int dayTotal = 0;
            for (Hydration hydration : hydrations) {
                Date hydrationDate = hydration.getDate();
                if (!hydrationDate.before(dayStart) && !hydrationDate.after(dayEnd)) {
                    dayTotal += (int)(hydration.getQuantity() * 1000);
                }
            }

            if (dayTotal > 0) {
                weekTotal += dayTotal;
                weekDays++;
            }

            day.add(Calendar.DAY_OF_MONTH, 1);
            day.set(Calendar.HOUR_OF_DAY, 0);
            day.set(Calendar.MINUTE, 0);
            day.set(Calendar.SECOND, 0);
        }

        return weekDays > 0 ? weekTotal / weekDays : 0;
    }

    private int calculateMonthAverageForPeriod(List<Hydration> hydrations, Date periodStart) {
        Calendar monthStart = Calendar.getInstance();
        monthStart.set(Calendar.DAY_OF_MONTH, 1);
        monthStart.set(Calendar.HOUR_OF_DAY, 0);
        monthStart.set(Calendar.MINUTE, 0);
        monthStart.set(Calendar.SECOND, 0);
        monthStart.set(Calendar.MILLISECOND, 0);
        Date startOfMonth = monthStart.getTime();
        startOfMonth = startOfMonth.before(periodStart) ? periodStart : startOfMonth;

        int monthTotal = 0;
        int monthDays = 0;

        Calendar day = (Calendar) monthStart.clone();
        Calendar now = Calendar.getInstance();

        while (!day.after(now)) {
            Date dayStart = day.getTime();
            day.set(Calendar.HOUR_OF_DAY, 23);
            day.set(Calendar.MINUTE, 59);
            day.set(Calendar.SECOND, 59);
            Date dayEnd = day.getTime();

            int dayTotal = 0;
            for (Hydration hydration : hydrations) {
                Date hydrationDate = hydration.getDate();
                if (!hydrationDate.before(dayStart) && !hydrationDate.after(dayEnd)) {
                    dayTotal += (int)(hydration.getQuantity() * 1000);
                }
            }

            if (dayTotal > 0) {
                monthTotal += dayTotal;
                monthDays++;
            }

            day.add(Calendar.DAY_OF_MONTH, 1);
            day.set(Calendar.HOUR_OF_DAY, 0);
            day.set(Calendar.MINUTE, 0);
            day.set(Calendar.SECOND, 0);
        }

        return monthDays > 0 ? monthTotal / monthDays : 0;
    }

    private int calculateStreakForPeriod(List<Hydration> hydrations, int objective, int todayConsumption) {
        // Definimos un umbral (30% del objetivo) para considerar el día como válido
        int threshold = (int)(objective * 0.3);

        int streak = 0;
        Calendar checkDay = Calendar.getInstance();
        checkDay.add(Calendar.DAY_OF_MONTH, -1); // Empezar desde ayer

        boolean streakBroken = false;
        while (!streakBroken) {
            checkDay.set(Calendar.HOUR_OF_DAY, 0);
            checkDay.set(Calendar.MINUTE, 0);
            checkDay.set(Calendar.SECOND, 0);
            checkDay.set(Calendar.MILLISECOND, 0);
            Date dayStart = checkDay.getTime();

            checkDay.set(Calendar.HOUR_OF_DAY, 23);
            checkDay.set(Calendar.MINUTE, 59);
            checkDay.set(Calendar.SECOND, 59);
            Date dayEnd = checkDay.getTime();

            int dayTotal = 0;
            for (Hydration hydration : hydrations) {
                Date hydrationDate = hydration.getDate();
                if (!hydrationDate.before(dayStart) && !hydrationDate.after(dayEnd)) {
                    dayTotal += (int)(hydration.getQuantity() * 1000);
                }
            }

            // Usamos el umbral en lugar del objetivo completo
            if (dayTotal < threshold) {
                streakBroken = true;
            } else {
                streak++;
                checkDay.add(Calendar.DAY_OF_MONTH, -1);
            }
        }

        // También usamos el umbral para hoy
        if (todayConsumption >= threshold) {
            streak++;
        }

        return streak;
    }
}
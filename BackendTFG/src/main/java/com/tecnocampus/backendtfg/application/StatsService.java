package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.StatsDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.ActivityProfile;
import com.tecnocampus.backendtfg.domain.DailySteps;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.domain.AbstractActivity;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

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
}
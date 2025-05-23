package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.HydrationTrendDTO;
import com.tecnocampus.backendtfg.application.dto.SleepStageDataSetDTO;
import com.tecnocampus.backendtfg.application.dto.SleepStageTrendDTO;
import com.tecnocampus.backendtfg.application.dto.TrendsDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.*;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrendService {
    private final UserRepository userRepository;

    private final JwtUtils jwtUtils;

    public TrendService(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    private String getEmailFromToken(String token) {
        return jwtUtils.extractEmail(token);
    }

    public TrendsDTO getActivityTrends(String token, String period) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();

        if (!period.equalsIgnoreCase("week") && !period.equalsIgnoreCase("month")
                && !period.equalsIgnoreCase("year")) {
            throw new IllegalArgumentException("El período debe ser 'week', 'month' o 'year'");
        }

        List<String> labels;
        List<Integer> values;

        switch (period.toLowerCase()) {
            case "week":
                labels = Arrays.asList("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
                values = getWeeklyActivityValues(activityProfile);
                break;
            case "month":
                labels = getMonthLabels();
                values = getMonthlyActivityValues(activityProfile);
                break;
            case "year":
                labels = Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
                values = getYearlyActivityValues(activityProfile);
                break;
            default:
                throw new IllegalArgumentException("Período inválido");
        }

        return new TrendsDTO(labels, values, "minutes");
    }

    private List<Integer> getWeeklyActivityValues(ActivityProfile activityProfile) {
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

        List<Integer> values = new ArrayList<>(Arrays.asList(0, 0, 0, 0, 0, 0, 0));

        for (AbstractActivity activity : activityProfile.getActivities()) {
            Date activityDate = activity.getDate();
            if (!activityDate.before(startOfWeek) && !activityDate.after(endOfWeek)) {
                Calendar activityCal = Calendar.getInstance();
                activityCal.setTime(activityDate);
                int dayOfWeekActivity = activityCal.get(Calendar.DAY_OF_WEEK);

                // Convertir de Calendar (domingo=1) a nuestro formato (lunes=0)
                int index = dayOfWeekActivity == Calendar.SUNDAY ? 6 : dayOfWeekActivity - Calendar.MONDAY;
                values.set(index, values.get(index) + (int) activity.getDuration());
            }
        }

        return values;
    }

    private List<String> getMonthLabels() {
        Calendar calendar = Calendar.getInstance();
        int daysInMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);

        List<String> labels = new ArrayList<>();
        for (int i = 1; i <= daysInMonth; i++) {
            labels.add(String.valueOf(i));
        }

        return labels;
    }

    private List<Integer> getMonthlyActivityValues(ActivityProfile activityProfile) {
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

        for (AbstractActivity activity : activityProfile.getActivities()) {
            Date activityDate = activity.getDate();
            if (!activityDate.before(startOfMonth) && !activityDate.after(endOfMonth)) {
                Calendar activityCal = Calendar.getInstance();
                activityCal.setTime(activityDate);
                int dayOfMonth = activityCal.get(Calendar.DAY_OF_MONTH);
                values.set(dayOfMonth - 1, values.get(dayOfMonth - 1) + (int) activity.getDuration());
            }
        }

        return values;
    }

    private List<Integer> getYearlyActivityValues(ActivityProfile activityProfile) {
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

        for (AbstractActivity activity : activityProfile.getActivities()) {
            Date activityDate = activity.getDate();
            if (!activityDate.before(startOfYear) && !activityDate.after(endOfYear)) {
                Calendar activityCal = Calendar.getInstance();
                activityCal.setTime(activityDate);
                int month = activityCal.get(Calendar.MONTH);
                values.set(month, values.get(month) + (int) activity.getDuration());
            }
        }

        return values;
    }

    public TrendsDTO getStepsTrends(String token, String period) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();

        if (!period.equalsIgnoreCase("week") && !period.equalsIgnoreCase("month")
                && !period.equalsIgnoreCase("year")) {
            throw new IllegalArgumentException("El período debe ser 'week', 'month' o 'year'");
        }

        List<String> labels;
        List<Integer> values;

        switch (period.toLowerCase()) {
            case "week":
                labels = Arrays.asList("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
                values = getWeeklyStepsValues(activityProfile);
                break;
            case "month":
                labels = getMonthLabels();
                values = getMonthlyStepsValues(activityProfile);
                break;
            case "year":
                labels = Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
                values = getYearlyStepsValues(activityProfile);
                break;
            default:
                throw new IllegalArgumentException("Período inválido");
        }

        return new TrendsDTO(labels, values, "steps");
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

    public TrendsDTO getSleepTrends(String token, String period) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();

        if (!period.equalsIgnoreCase("week") && !period.equalsIgnoreCase("month")
                && !period.equalsIgnoreCase("year")) {
            throw new IllegalArgumentException("El período debe ser 'week', 'month' o 'year'");
        }

        List<String> labels;
        List<Double> doubleValues;

        switch (period.toLowerCase()) {
            case "week":
                labels = Arrays.asList("Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom");
                doubleValues = getWeeklySleepValues(sleepProfile);
                break;
            case "month":
                labels = getMonthLabels();
                doubleValues = getMonthlySleepValues(sleepProfile);
                break;
            case "year":
                labels = Arrays.asList("Ene", "Feb", "Mar", "Abr", "May", "Jun",
                        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");
                doubleValues = getYearlySleepValues(sleepProfile);
                break;
            default:
                throw new IllegalArgumentException("Período inválido");
        }

        List<Integer> values = doubleValues.stream()
                .map(val -> (int)(val * 10))
                .collect(Collectors.toList());

        return new TrendsDTO(labels, values, "horas");
    }

    private List<Double> getWeeklySleepValues(SleepProfile sleepProfile) {
        Calendar calendar = Calendar.getInstance();

        int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
        int daysToSubtract = (dayOfWeek == Calendar.SUNDAY) ? 6 : dayOfWeek - Calendar.MONDAY;
        calendar.add(Calendar.DAY_OF_MONTH, -daysToSubtract);

        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        Date startOfWeek = calendar.getTime();

        calendar.add(Calendar.DAY_OF_MONTH, 6);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfWeek = calendar.getTime();

        List<Double> values = Arrays.asList(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        int[] counts = new int[7];

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date sleepDate = sleep.getEndTime(); // <- CAMBIO AQUÍ
            if (!sleepDate.before(startOfWeek) && !sleepDate.after(endOfWeek)) {
                Calendar sleepCal = Calendar.getInstance();
                sleepCal.setTime(sleepDate);
                int index = sleepCal.get(Calendar.DAY_OF_WEEK);
                index = (index == Calendar.SUNDAY) ? 6 : index - Calendar.MONDAY;

                values.set(index, values.get(index) + sleep.getHours());
                counts[index]++;
            }
        }

        for (int i = 0; i < 7; i++) {
            if (counts[i] > 0) {
                double avg = Math.round(values.get(i) / counts[i] * 10) / 10.0;
                values.set(i, avg);
            }
        }

        return values;
    }

    private List<Double> getMonthlySleepValues(SleepProfile sleepProfile) {
        Calendar calendar = Calendar.getInstance();

        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfMonth = calendar.getTime();

        int lastDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        calendar.set(Calendar.DAY_OF_MONTH, lastDay);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfMonth = calendar.getTime();

        List<Double> values = new ArrayList<>();
        int[] counts = new int[lastDay];

        for (int i = 0; i < lastDay; i++) {
            values.add(0.0);
        }

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date sleepDate = sleep.getEndTime(); // <- CAMBIO AQUÍ
            if (!sleepDate.before(startOfMonth) && !sleepDate.after(endOfMonth)) {
                Calendar sleepCal = Calendar.getInstance();
                sleepCal.setTime(sleepDate);
                int dayOfMonth = sleepCal.get(Calendar.DAY_OF_MONTH);
                values.set(dayOfMonth - 1, values.get(dayOfMonth - 1) + sleep.getHours());
                counts[dayOfMonth - 1]++;
            }
        }

        for (int i = 0; i < lastDay; i++) {
            if (counts[i] > 0) {
                double avg = Math.round(values.get(i) / counts[i] * 10) / 10.0;
                values.set(i, avg);
            }
        }

        return values;
    }


    private List<Double> getYearlySleepValues(SleepProfile sleepProfile) {
        Calendar calendar = Calendar.getInstance();
        int currentYear = calendar.get(Calendar.YEAR);

        calendar.set(Calendar.YEAR, currentYear);
        calendar.set(Calendar.MONTH, Calendar.JANUARY);
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfYear = calendar.getTime();

        calendar.set(Calendar.MONTH, Calendar.DECEMBER);
        calendar.set(Calendar.DAY_OF_MONTH, 31);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfYear = calendar.getTime();

        List<Double> values = new ArrayList<>(Arrays.asList(
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0));
        int[] counts = new int[12];

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date sleepDate = sleep.getEndTime(); // <- CAMBIO AQUÍ
            if (!sleepDate.before(startOfYear) && !sleepDate.after(endOfYear)) {
                Calendar sleepCal = Calendar.getInstance();
                sleepCal.setTime(sleepDate);
                int month = sleepCal.get(Calendar.MONTH);
                values.set(month, values.get(month) + sleep.getHours());
                counts[month]++;
            }
        }

        for (int i = 0; i < 12; i++) {
            if (counts[i] > 0) {
                double avg = Math.round(values.get(i) / counts[i] * 10) / 10.0;
                values.set(i, avg);
            }
        }

        return values;
    }

    public TrendsDTO getSleepQualityTrends(String token, String period) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();

        if (!period.equalsIgnoreCase("week") && !period.equalsIgnoreCase("month")
                && !period.equalsIgnoreCase("year")) {
            throw new IllegalArgumentException("El período debe ser 'week', 'month' o 'year'");
        }

        List<String> labels;
        List<Double> doubleValues;

        switch (period.toLowerCase()) {
            case "week":
                labels = Arrays.asList("Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom");
                doubleValues = getWeeklySleepQualityValues(sleepProfile);
                break;
            case "month":
                labels = getMonthLabels();
                doubleValues = getMonthlySleepQualityValues(sleepProfile);
                break;
            case "year":
                labels = Arrays.asList("Ene", "Feb", "Mar", "Abr", "May", "Jun",
                        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");
                doubleValues = getYearlySleepQualityValues(sleepProfile);
                break;
            default:
                throw new IllegalArgumentException("Período inválido");
        }

        // Convertir valores Double a Integer multiplicando por 10 para preservar un decimal
        List<Integer> values = doubleValues.stream()
                .map(val -> (int)(val * 10))
                .collect(Collectors.toList());

        return new TrendsDTO(labels, values, "calidad");
    }



    private List<Double> getWeeklySleepQualityValues(SleepProfile sleepProfile) {
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
        List<Double> values = Arrays.asList(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        int[] counts = new int[7]; // Para calcular promedios

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date sleepDate = sleep.getEndTime(); // CAMBIO: usar endTime para consistencia
            if (!sleepDate.before(startOfWeek) && !sleepDate.after(endOfWeek)) {
                Calendar sleepCal = Calendar.getInstance();
                sleepCal.setTime(sleepDate);
                int dayOfWeekSleep = sleepCal.get(Calendar.DAY_OF_WEEK);
                int index = dayOfWeekSleep == Calendar.SUNDAY ? 6 : dayOfWeekSleep - Calendar.MONDAY;

                values.set(index, values.get(index) + sleep.getQuality());
                counts[index]++;
            }
        }

        // Calcular promedios para cada día
        for (int i = 0; i < 7; i++) {
            if (counts[i] > 0) {
                double avg = Math.round(values.get(i) / counts[i] * 10) / 10.0;
                values.set(i, avg);
            }
        }

        return values;
    }

    private List<Double> getMonthlySleepQualityValues(SleepProfile sleepProfile) {
        Calendar calendar = Calendar.getInstance();

        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfMonth = calendar.getTime();

        int lastDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        calendar.set(Calendar.DAY_OF_MONTH, lastDay);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfMonth = calendar.getTime();

        List<Double> values = new ArrayList<>();
        int[] counts = new int[lastDay];

        for (int i = 0; i < lastDay; i++) {
            values.add(0.0);
        }

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date sleepDate = sleep.getEndTime(); // <- CAMBIO AQUÍ
            if (!sleepDate.before(startOfMonth) && !sleepDate.after(endOfMonth)) {
                Calendar sleepCal = Calendar.getInstance();
                sleepCal.setTime(sleepDate);
                int dayOfMonth = sleepCal.get(Calendar.DAY_OF_MONTH);

                values.set(dayOfMonth - 1, values.get(dayOfMonth - 1) + sleep.getQuality());
                counts[dayOfMonth - 1]++;
            }
        }

        for (int i = 0; i < lastDay; i++) {
            if (counts[i] > 0) {
                double avg = Math.round(values.get(i) / counts[i] * 10) / 10.0;
                values.set(i, avg);
            }
        }

        return values;
    }

    private List<Double> getYearlySleepQualityValues(SleepProfile sleepProfile) {
        Calendar calendar = Calendar.getInstance();
        int currentYear = calendar.get(Calendar.YEAR);

        calendar.set(Calendar.YEAR, currentYear);
        calendar.set(Calendar.MONTH, Calendar.JANUARY);
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfYear = calendar.getTime();

        calendar.set(Calendar.MONTH, Calendar.DECEMBER);
        calendar.set(Calendar.DAY_OF_MONTH, 31);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfYear = calendar.getTime();

        List<Double> values = new ArrayList<>(Arrays.asList(
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0));
        int[] counts = new int[12];

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date sleepDate = sleep.getEndTime(); // <- CAMBIO AQUÍ
            if (!sleepDate.before(startOfYear) && !sleepDate.after(endOfYear)) {
                Calendar sleepCal = Calendar.getInstance();
                sleepCal.setTime(sleepDate);
                int month = sleepCal.get(Calendar.MONTH);

                values.set(month, values.get(month) + sleep.getQuality());
                counts[month]++;
            }
        }

        for (int i = 0; i < 12; i++) {
            if (counts[i] > 0) {
                double avg = Math.round(values.get(i) / counts[i] * 10) / 10.0;
                values.set(i, avg);
            }
        }

        return values;
    }

    public SleepStageTrendDTO getSleepStages(String token, String period) {
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();

        List<String> labels;
        switch (period.toLowerCase()) {
            case "week":
                labels = Arrays.asList("Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom");
                break;
            case "month":
                labels = getMonthLabels();
                break;
            case "year":
                labels = Arrays.asList("Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");
                break;
            default:
                throw new IllegalArgumentException("Periodo inválido");
        }

        // Crear listas independientes para cada tipo de etapa
        List<Integer> remValues = new ArrayList<>(getSleepStageValues(sleepProfile, period, StageType.REM));
        List<Integer> deepValues = new ArrayList<>(getSleepStageValues(sleepProfile, period, StageType.DEEP));
        List<Integer> lightValues = new ArrayList<>(getSleepStageValues(sleepProfile, period, StageType.LIGHT));
        List<Integer> awakeValues = new ArrayList<>(getSleepStageValues(sleepProfile, period, StageType.AWAKE_IN_BED));

        // Agregar logs para depuración
        System.out.println("REM: " + remValues);
        System.out.println("DEEP: " + deepValues);
        System.out.println("LIGHT: " + lightValues);
        System.out.println("AWAKE: " + awakeValues);

        // Crear datasets con listas independientes
        // Crear datasets sin el parámetro de color
        List<SleepStageDataSetDTO> datasets = new ArrayList<>();
        datasets.add(new SleepStageDataSetDTO("REM", remValues));
        datasets.add(new SleepStageDataSetDTO("DEEP", deepValues));
        datasets.add(new SleepStageDataSetDTO("LIGHT", lightValues));
        datasets.add(new SleepStageDataSetDTO("AWAKE_IN_BED", awakeValues));

        return new SleepStageTrendDTO(labels, datasets, "minutos");
    }

    private List<Integer> getSleepStageValues(SleepProfile sleepProfile, String period, StageType stageType) {
        switch (period.toLowerCase()) {
            case "week":
                return getWeeklySleepStageValues(sleepProfile, stageType);
            case "month":
                return getMonthlySleepStageValues(sleepProfile, stageType);
            case "year":
                return getYearlySleepStageValues(sleepProfile, stageType);
            default:
                throw new IllegalArgumentException("Período inválido");
        }
    }

    private List<Integer> getWeeklySleepStageValues(SleepProfile sleepProfile, StageType stageType) {
        List<Integer> values = Arrays.asList(0, 0, 0, 0, 0, 0, 0);

        Calendar calendar = Calendar.getInstance();
        int dow = calendar.get(Calendar.DAY_OF_WEEK);
        int subtract = (dow == Calendar.SUNDAY) ? 6 : dow - Calendar.MONDAY;
        calendar.add(Calendar.DAY_OF_MONTH, -subtract);

        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date start = calendar.getTime();

        calendar.add(Calendar.DAY_OF_MONTH, 6);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date end = calendar.getTime();

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date date = sleep.getEndTime();
            if (!date.before(start) && !date.after(end)) {
                Calendar sleepCal = Calendar.getInstance();
                sleepCal.setTime(date);
                int dayOfWeek = sleepCal.get(Calendar.DAY_OF_WEEK);
                int index = (dayOfWeek == Calendar.SUNDAY) ? 6 : dayOfWeek - Calendar.MONDAY;

                // Calcular minutos para este tipo específico de etapa
                int minutes = getSleepStageMinutes(sleep, stageType);
                values.set(index, values.get(index) + minutes);
            }
        }

        return values;
    }

    private List<Integer> getMonthlySleepStageValues(SleepProfile sleepProfile, StageType stageType) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfMonth = calendar.getTime();

        int lastDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        calendar.set(Calendar.DAY_OF_MONTH, lastDay);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfMonth = calendar.getTime();

        List<Integer> values = new ArrayList<>();
        for (int i = 0; i < lastDay; i++) {
            values.add(0);
        }

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date endTime = sleep.getEndTime();
            if (!endTime.before(startOfMonth) && !endTime.after(endOfMonth)) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(endTime);
                int day = cal.get(Calendar.DAY_OF_MONTH);

                // Determinar minutos según el tipo de etapa
                int minutes = getSleepStageMinutes(sleep, stageType);
                values.set(day - 1, values.get(day - 1) + minutes);
            }
        }

        return values;
    }

    private List<Integer> getYearlySleepStageValues(SleepProfile sleepProfile, StageType stageType) {
        Calendar calendar = Calendar.getInstance();
        int currentYear = calendar.get(Calendar.YEAR);

        calendar.set(Calendar.YEAR, currentYear);
        calendar.set(Calendar.MONTH, Calendar.JANUARY);
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfYear = calendar.getTime();

        calendar.set(Calendar.MONTH, Calendar.DECEMBER);
        calendar.set(Calendar.DAY_OF_MONTH, 31);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfYear = calendar.getTime();

        List<Integer> values = new ArrayList<>(Arrays.asList(
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ));

        for (Sleep sleep : sleepProfile.getSleeps()) {
            Date endTime = sleep.getEndTime();
            if (!endTime.before(startOfYear) && !endTime.after(endOfYear)) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(endTime);
                int month = cal.get(Calendar.MONTH);

                // Determinar minutos según el tipo de etapa
                int minutes = getSleepStageMinutes(sleep, stageType);
                values.set(month, values.get(month) + minutes);
            }
        }

        return values;
    }

    private int getSleepStageMinutes(Sleep sleep, StageType stageType) {
        // Añadir logs para depuración
        System.out.println("Calculando minutos para: " + stageType);
        System.out.println("Sleep ID: " + sleep.getId());
        System.out.println("Etapas totales en este Sleep: " + sleep.getSleepStages().size());

        // Contar etapas por tipo
        long remCount = sleep.getSleepStages().stream().filter(s -> s.getStageType() == StageType.REM).count();
        long deepCount = sleep.getSleepStages().stream().filter(s -> s.getStageType() == StageType.DEEP).count();
        long lightCount = sleep.getSleepStages().stream().filter(s -> s.getStageType() == StageType.LIGHT).count();
        long awakeCount = sleep.getSleepStages().stream().filter(s -> s.getStageType() == StageType.AWAKE || s.getStageType() == StageType.AWAKE_IN_BED).count();

        System.out.println("Distribución de etapas - REM: " + remCount + ", DEEP: " + deepCount +
                ", LIGHT: " + lightCount + ", AWAKE/AWAKE_IN_BED: " + awakeCount);

        // Utilizar los métodos específicos según el tipo de etapa
        int result = 0;
        switch(stageType) {
            case REM:
                result = sleep.getRemSleepMinutes();
                break;
            case DEEP:
                result = sleep.getDeepSleepMinutes();
                break;
            case LIGHT:
                result = sleep.getLightSleepMinutes();
                break;
            case AWAKE:
            case AWAKE_IN_BED:
                result = sleep.getAwakeSleepMinutes();
                break;
            default:
                // Si es otro tipo, usar el filtro genérico
                result = sleep.getSleepStages().stream()
                        .filter(stage -> stage.getStageType() == stageType)
                        .mapToInt(stage -> {
                            long durationMillis = stage.getEndTime().getTime() - stage.getStartTime().getTime();
                            return (int) (durationMillis / (60 * 1000));
                        })
                        .sum();
        }

        System.out.println("Resultado para " + stageType + ": " + result + " minutos");
        return result;
    }

    public HydrationTrendDTO getHydrationTrends(String token, String period) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        HydrationProfile hydrationProfile = user.getHydrationProfile();

        if (!period.equalsIgnoreCase("week") && !period.equalsIgnoreCase("month")
                && !period.equalsIgnoreCase("year")) {
            throw new IllegalArgumentException("El período debe ser 'week', 'month' o 'year'");
        }

        List<String> labels;
        List<Integer> values;

        switch (period.toLowerCase()) {
            case "week":
                labels = Arrays.asList("Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom");
                values = getWeeklyHydrationValues(hydrationProfile);
                break;
            case "month":
                labels = getMonthLabels();
                values = getMonthlyHydrationValues(hydrationProfile);
                break;
            case "year":
                labels = Arrays.asList("Ene", "Feb", "Mar", "Abr", "May", "Jun",
                        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");
                values = getYearlyHydrationValues(hydrationProfile);
                break;
            default:
                throw new IllegalArgumentException("Período inválido");
        }

        // Calcular estadísticas
        int average = calculateAverage(values);
        int max = values.stream().mapToInt(Integer::intValue).max().orElse(0);
        int min = values.stream().filter(v -> v > 0).mapToInt(Integer::intValue).min().orElse(0);
        int objective = (int) (hydrationProfile.getDailyObjectiveWater() * 1000); // Convertir de litros a ml

        return new HydrationTrendDTO(labels, values, average, max, min, objective);
    }

    private int calculateAverage(List<Integer> values) {
        if (values.isEmpty()) return 0;
        List<Integer> nonZeroValues = values.stream().filter(v -> v > 0).collect(Collectors.toList());
        return nonZeroValues.isEmpty() ? 0 :
                (int) nonZeroValues.stream().mapToInt(Integer::intValue).average().orElse(0);
    }

    private List<Integer> getWeeklyHydrationValues(HydrationProfile hydrationProfile) {
        Calendar calendar = Calendar.getInstance();

        // Retroceder al lunes de la semana actual
        int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
        int daysToSubtract = (dayOfWeek == Calendar.SUNDAY) ? 6 : dayOfWeek - Calendar.MONDAY;
        calendar.add(Calendar.DAY_OF_MONTH, -daysToSubtract);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfWeek = calendar.getTime();

        // Calcular fin de semana
        calendar.add(Calendar.DAY_OF_MONTH, 6);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfWeek = calendar.getTime();

        List<Integer> values = Arrays.asList(0, 0, 0, 0, 0, 0, 0);

        for (Hydration hydration : hydrationProfile.getHydrations()) {
            Date hydrationDate = hydration.getDate();
            if (!hydrationDate.before(startOfWeek) && !hydrationDate.after(endOfWeek)) {
                Calendar hydrationCal = Calendar.getInstance();
                hydrationCal.setTime(hydrationDate);
                int dayOfWeekHydration = hydrationCal.get(Calendar.DAY_OF_WEEK);
                int index = dayOfWeekHydration == Calendar.SUNDAY ? 6 : dayOfWeekHydration - Calendar.MONDAY;
                values.set(index, values.get(index) + (int)(hydration.getQuantity() * 1000));
            }
        }

        return values;
    }

    private List<Integer> getMonthlyHydrationValues(HydrationProfile hydrationProfile) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfMonth = calendar.getTime();

        int lastDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        calendar.set(Calendar.DAY_OF_MONTH, lastDay);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfMonth = calendar.getTime();

        List<Integer> values = new ArrayList<>();
        for (int i = 0; i < lastDay; i++) {
            values.add(0);
        }

        for (Hydration hydration : hydrationProfile.getHydrations()) {
            Date hydrationDate = hydration.getDate();
            if (!hydrationDate.before(startOfMonth) && !hydrationDate.after(endOfMonth)) {
                Calendar hydrationCal = Calendar.getInstance();
                hydrationCal.setTime(hydrationDate);
                int dayOfMonth = hydrationCal.get(Calendar.DAY_OF_MONTH);
                values.set(dayOfMonth - 1, values.get(dayOfMonth - 1) + (int)(hydration.getQuantity() * 1000));
            }
        }

        return values;
    }

    private List<Integer> getYearlyHydrationValues(HydrationProfile hydrationProfile) {
        Calendar calendar = Calendar.getInstance();
        int currentYear = calendar.get(Calendar.YEAR);

        calendar.set(Calendar.YEAR, currentYear);
        calendar.set(Calendar.MONTH, Calendar.JANUARY);
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfYear = calendar.getTime();

        calendar.set(Calendar.MONTH, Calendar.DECEMBER);
        calendar.set(Calendar.DAY_OF_MONTH, 31);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endOfYear = calendar.getTime();

        List<Integer> values = new ArrayList<>(Arrays.asList(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));

        for (Hydration hydration : hydrationProfile.getHydrations()) {
            Date hydrationDate = hydration.getDate();
            if (!hydrationDate.before(startOfYear) && !hydrationDate.after(endOfYear)) {
                Calendar hydrationCal = Calendar.getInstance();
                hydrationCal.setTime(hydrationDate);
                int month = hydrationCal.get(Calendar.MONTH);
                values.set(month, values.get(month) + (int)(hydration.getQuantity() * 1000));
            }
        }

        return values;
    }
}

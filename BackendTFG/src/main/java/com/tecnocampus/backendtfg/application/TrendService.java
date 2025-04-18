package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.TrendsDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.AbstractActivity;
import com.tecnocampus.backendtfg.domain.ActivityProfile;
import com.tecnocampus.backendtfg.domain.DailySteps;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

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
}

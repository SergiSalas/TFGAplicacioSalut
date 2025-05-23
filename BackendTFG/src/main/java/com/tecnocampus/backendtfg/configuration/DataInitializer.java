package com.tecnocampus.backendtfg.configuration;

import com.tecnocampus.backendtfg.domain.*;
import com.tecnocampus.backendtfg.persistence.ActivityProfileRepository;
import com.tecnocampus.backendtfg.persistence.HydrationProfileRepository;
import com.tecnocampus.backendtfg.persistence.HydrationRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ActivityProfileRepository activityProfileRepository;
    private final HydrationRepository hydrationRepository;
    private final HydrationProfileRepository hydrationProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();
    private final TypeActivity[] allTypes = TypeActivity.values();

    @Autowired
    public DataInitializer(UserRepository userRepository,
                           ActivityProfileRepository activityProfileRepository,
                           PasswordEncoder passwordEncoder,
                           HydrationRepository hydrationRepository,
                           HydrationProfileRepository hydrationProfileRepository) {
        this.userRepository = userRepository;
        this.activityProfileRepository = activityProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.hydrationRepository = hydrationRepository;
        this.hydrationProfileRepository = hydrationProfileRepository;
    }

    @Override
    public void run(String... args) {
        // Verificar si ya existe el usuario
        User user = userRepository.findByEmail("usuario@example.com");

        if (user == null) {
            // Crear usuario si no existe
            user = createUser();
            System.out.println("Usuario creado correctamente");
        }

        // Verificar si el perfil de actividad existe
        if (user.getActivityProfile() == null) {
            ActivityProfile profile = new ActivityProfile(user);
            profile.setDailyObjectiveDistance(10000);
            user.setActivityProfile(profile);
            userRepository.save(user);
            System.out.println("Perfil de actividad creado correctamente");
        }

        // Verificar si el perfil de sueño existe
        if (user.getSleepProfile() == null) {
            SleepProfile sleepProfile = new SleepProfile(user);
            sleepProfile.setDailyObjectiveSleep(8);
            user.setSleepProfile(sleepProfile);
            userRepository.save(user);
            System.out.println("Perfil de sueño creado correctamente");
        }

        if (user.getHydrationProfile() == null) {
            HydrationProfile hydrationProfile = new HydrationProfile(user);
            hydrationProfile.setDailyObjectiveWater(2.5);
            user.setHydrationProfile(hydrationProfile);
            hydrationProfileRepository.save(hydrationProfile);
            userRepository.save(user);
            System.out.println("Perfil de hidratación creado correctamente");
        }

        // Generar actividades solo si hay menos de 10
        if (user.getActivityProfile().getActivities().size() < 10) {
            generateActivitiesForOneYear(user);
            userRepository.save(user);
            System.out.println("Actividades generadas correctamente: " +
                    user.getActivityProfile().getActivities().size());
        }

        if (user.getActivityProfile().getDailySteps().size() < 10) {
            generateDailyStepsForOneYear(user);
            userRepository.save(user);
            System.out.println("DailySteps generados correctamente: " +
                    user.getActivityProfile().getDailySteps().size());
        }

        if (user.getSleepProfile().getSleeps().size() < 10) {
            generateSleepDataForOneYear(user);
            userRepository.save(user);
            System.out.println("Datos de sueño generados correctamente: " +
                    user.getSleepProfile().getSleeps().size());
        }

        // Generar datos de hidratación solo si hay menos de 10
        if (user.getHydrationProfile().getHydrations().size() < 10) {
            generateHydrationDataForOneYear(user);
            userRepository.save(user);
            System.out.println("Datos de hidratación generados correctamente: " +
                    user.getHydrationProfile().getHydrations().size());
        }
    }

    private User createUser() {
        User user = new User();
        user.setId("550e8400-e29b-41d4-a716-446655440000");
        user.setName("Usuario Demo");
        user.setEmail("usuario@example.com");
        user.setPassword(passwordEncoder.encode("password"));
        user.setWeight(75.5);
        user.setHeight(175);
        user.setAge(30);
        user.setGender(Gender.MALE);

        // Crear perfiles
        ActivityProfile activityProfile = new ActivityProfile(user);
        activityProfile.setId("550e8400-e29b-41d4-a716-446655440001");
        activityProfile.setDailyObjectiveDistance(10000);
        user.setActivityProfile(activityProfile);

        SleepProfile sleepProfile = new SleepProfile(user);
        sleepProfile.setId("550e8400-e29b-41d4-a716-446655440002");
        sleepProfile.setDailyObjectiveSleep(8);
        user.setSleepProfile(sleepProfile);

        HydrationProfile hydrationProfile = new HydrationProfile(user);
        hydrationProfile.setId("550e8400-e29b-41d4-a716-446655440003");
        hydrationProfile.setDailyObjectiveWater(2.5);
        user.setHydrationProfile(hydrationProfile);

        Level level = new Level();
        level.setCurrentLevel(5);
        level.setCurrentExp(50);
        level.setExpToNextLevel(300);
        user.setLevel(level);

        return userRepository.save(user);
    }

    private void generateActivitiesForOneYear(User user) {
        LocalDate startDate = LocalDate.now().minusYears(1);
        LocalDate endDate = LocalDate.now();
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1; // Cálculo correcto de días
        ActivityProfile profile = user.getActivityProfile();

        for (int i = 0; i < days; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            Date date = Date.from(currentDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

            // Elegir tipo y valores aleatorios
            TypeActivity type = allTypes[i % allTypes.length];
            double duration = 20 + random.nextInt(70);
            String description = "Sesión de entrenamiento - Día " + (i + 1);

            AbstractActivity activity;
            if (i % 2 == 0) {
                activity = new AppActivity(duration, date, type, description, profile);
            } else {
                activity = new HealthConnectActivity(duration, date, type, description, profile);
            }

            activity.calculateCalories();
            profile.addActivity(activity);
        }
    }

    private void generateDailyStepsForOneYear(User user) {
        LocalDate startDate = LocalDate.now().minusYears(1);
        LocalDate endDate = LocalDate.now();
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1; // Cálculo correcto de días
        ActivityProfile profile = user.getActivityProfile();

        for (int i = 0; i < days; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            Date date = Date.from(currentDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

            // Generar valores aleatorios para pasos
            int steps = 5000 + random.nextInt(10000); // Entre 5000 y 15000 pasos
            int duration = 30 + random.nextInt(60);   // Entre 30 y 90 minutos

            DailySteps dailySteps = new DailySteps(steps, date, duration, profile);
            profile.addDailySteps(dailySteps);
        }
    }

    private void generateSleepDataForOneYear(User user) {
        SleepProfile sleepProfile = user.getSleepProfile();
        Random random = new Random();

        // Fecha actual menos un año
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.YEAR, -1);

        // Generamos datos para cada día del año
        for (int i = 0; i < 365; i++) {
            // Algunos días aleatorios sin datos (20% probabilidad)
            if (random.nextDouble() < 0.2) {
                calendar.add(Calendar.DAY_OF_MONTH, 1);
                continue;
            }

            // Hora de acostarse (entre 22:00 y 00:30)
            calendar.set(Calendar.HOUR_OF_DAY, 22 + random.nextInt(3));
            calendar.set(Calendar.MINUTE, random.nextInt(60));
            Date startTime = calendar.getTime();

            // Duración del sueño (entre 6 y 9 horas)
            double hours = 6 + random.nextDouble() * 3;

            // Avanzamos para obtener la hora de despertar
            calendar.add(Calendar.MINUTE, (int)(hours * 60));
            Date endTime = calendar.getTime();

            // Calidad (entre 50 y 100)
            int quality = 50 + random.nextInt(51);


            // Creamos el registro de sueño
            Sleep sleep = new Sleep();
            sleep.setStartTime(startTime);
            sleep.setEndTime(endTime);
            sleep.setHours(hours);
            sleep.setQuality(quality);
            sleep.setSleepProfile(sleepProfile);

            // Creamos al menos 4 etapas de sueño para cada noche
            List<SleepStage> stages = generateSleepStages(sleep);
            sleep.setSleepStages(stages);

            sleepProfile.getSleeps().add(sleep);

            // Avanzamos al siguiente día (desde la hora de despertar)
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.add(Calendar.DAY_OF_MONTH, 1);
        }
    }

    private List<SleepStage> generateSleepStages(Sleep sleep) {
        List<SleepStage> stages = new ArrayList<>();

        // Obtenemos el tiempo total del sueño en milisegundos
        long startTimeMs = sleep.getStartTime().getTime();
        long endTimeMs = sleep.getEndTime().getTime();
        long totalDurationMs = endTimeMs - startTimeMs;

        // Distribución aproximada de las fases de sueño
        // DEEP: ~20%, LIGHT: ~50%, REM: ~25%, AWAKE: ~5%
        long deepDurationMs = totalDurationMs * 20 / 100;
        long lightDurationMs = totalDurationMs * 50 / 100;
        long remDurationMs = totalDurationMs * 25 / 100;
        long awakeDurationMs = totalDurationMs - deepDurationMs - lightDurationMs - remDurationMs; // El resto

        // Creamos las etapas con tiempo progresivo
        // 1. DEEP (al principio de la noche)
        Date deepStart = new Date(startTimeMs);
        Date deepEnd = new Date(startTimeMs + deepDurationMs);
        stages.add(new SleepStage(deepStart, deepEnd, StageType.DEEP, sleep));

        // 2. LIGHT (después del sueño profundo)
        Date lightStart = deepEnd;
        Date lightEnd = new Date(lightStart.getTime() + lightDurationMs);
        stages.add(new SleepStage(lightStart, lightEnd, StageType.LIGHT, sleep));

        // 3. REM (generalmente ocurre después de LIGHT)
        Date remStart = lightEnd;
        Date remEnd = new Date(remStart.getTime() + remDurationMs);
        stages.add(new SleepStage(remStart, remEnd, StageType.REM, sleep));

        // 4. AWAKE (períodos cortos al final)
        Date awakeStart = remEnd;
        Date awakeEnd = new Date(endTimeMs);
        stages.add(new SleepStage(awakeStart, awakeEnd, StageType.AWAKE_IN_BED, sleep));

        return stages;
    }


    private void generateHydrationDataForOneYear(User user) {
        HydrationProfile profile = user.getHydrationProfile();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(1);

        Random random = new Random();

        for (LocalDate date = startDate; date.isBefore(endDate) || date.isEqual(endDate); date = date.plusDays(1)) {
            // Genera entre 0-5 registros por día
            int recordsForDay = random.nextInt(6);

            for (int i = 0; i < recordsForDay; i++) {
                // Generar una cantidad aleatoria de agua (en litros, entre 0.1 y 0.5)
                double amount = 0.1 + random.nextDouble() * 0.4;
                amount = Math.round(amount * 100) / 100.0; // Redondear a 2 decimales

                // Convertir LocalDate a Date
                Date recordDate = Date.from(date.atStartOfDay()
                        .plusHours(random.nextInt(16) + 7) // Entre 7am y 11pm
                        .plusMinutes(random.nextInt(60))
                        .atZone(ZoneId.systemDefault())
                        .toInstant());

                Hydration hydration = new Hydration(amount, recordDate, profile);
                profile.addHydration(hydration);
            }
        }

        // Actualizar el total del día actual
        updateCurrentDayHydration(profile);
    }

    private void updateCurrentDayHydration(HydrationProfile profile) {
        // Establecer currentAmount a 0
        profile.resetDailyAmount();

        // Calcular el inicio del día actual
        Calendar today = Calendar.getInstance();
        today.set(Calendar.HOUR_OF_DAY, 0);
        today.set(Calendar.MINUTE, 0);
        today.set(Calendar.SECOND, 0);
        today.set(Calendar.MILLISECOND, 0);

        // Sumar las hidrataciones del día actual
        for (Hydration hydration : profile.getHydrations()) {
            if (hydration.getDate().after(today.getTime())) {
                profile.setCurrentAmount(profile.getCurrentAmount() + hydration.getQuantity());
            }
        }
    }
}


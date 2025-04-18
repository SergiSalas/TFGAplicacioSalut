package com.tecnocampus.backendtfg.configuration;

import com.tecnocampus.backendtfg.domain.*;
import com.tecnocampus.backendtfg.persistence.ActivityProfileRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ActivityProfileRepository activityProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();
    private final TypeActivity[] allTypes = TypeActivity.values();

    @Autowired
    public DataInitializer(UserRepository userRepository,
                           ActivityProfileRepository activityProfileRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.activityProfileRepository = activityProfileRepository;
        this.passwordEncoder = passwordEncoder;
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
        return userRepository.save(user);
    }

    private void generateActivitiesForOneYear(User user) {
        LocalDate startDate = LocalDate.now().minusYears(1);
        ActivityProfile profile = user.getActivityProfile();

        for (int i = 0; i < 365; i++) {
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
        ActivityProfile profile = user.getActivityProfile();

        for (int i = 0; i < 365; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            Date date = Date.from(currentDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

            // Generar valores aleatorios para pasos
            int steps = 5000 + random.nextInt(10000); // Entre 5000 y 15000 pasos
            int duration = 30 + random.nextInt(60);   // Entre 30 y 90 minutos

            DailySteps dailySteps = new DailySteps(steps, date, duration, profile);
            profile.addDailySteps(dailySteps);
        }
    }
}
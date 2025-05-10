package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.ChallengeDTO;
import com.tecnocampus.backendtfg.application.dto.LevelDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.*;
import com.tecnocampus.backendtfg.persistence.ChallengeRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChallengeService {

    private final UserRepository userRepository;
    private final ChallengeRepository challengeRepository;
    private final JwtUtils jwtUtils;
    private final Random random = new Random();

    public ChallengeService(UserRepository userRepository, ChallengeRepository challengeRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.challengeRepository = challengeRepository;
        this.jwtUtils = jwtUtils;
    }

    public LevelDTO getUserLevel(String token) {
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);
        return new LevelDTO(user.getLevel());
    }

    public List<ChallengeDTO> generateDailyChallenges(String token) {
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);

        // Eliminar retos antiguos no completados
        cleanOldChallenges(user);

        // Comprobar si ya tiene retos activos hoy
        Calendar today = Calendar.getInstance();
        today.set(Calendar.HOUR_OF_DAY, 0);
        today.set(Calendar.MINUTE, 0);
        today.set(Calendar.SECOND, 0);

        List<Challenge> todayChallenges = challengeRepository.findByUserAndCreationDateAfter(user, today.getTime());
        if (todayChallenges.size() >= 3) {
            return todayChallenges.stream()
                    .map(ChallengeDTO::new)
                    .collect(Collectors.toList());
        }

        // Generar nuevos retos
        List<Challenge> newChallenges = new ArrayList<>();

        // Obtener todos los tipos de desafíos disponibles
        List<ChallengeType> availableTypes = new ArrayList<>(Arrays.asList(ChallengeType.values()));
        Collections.shuffle(availableTypes);

        // Determinar cuántos desafíos crear (mínimo 3, máximo según tipos disponibles)
        int numChallengesToCreate = Math.min(3 + random.nextInt(availableTypes.size() - 2), availableTypes.size());
        numChallengesToCreate = Math.max(numChallengesToCreate, 3); // Garantizar mínimo 3

        // Generar los desafíos
        for (int i = 0; i < numChallengesToCreate; i++) {
            ChallengeType type = availableTypes.get(i);
            Challenge challenge = createChallengeByType(type, user);
            if (challenge != null) {
                user.addChallenge(challenge);
                newChallenges.add(challenge);
            }
        }

        userRepository.save(user);
        return newChallenges.stream()
                .map(ChallengeDTO::new)
                .collect(Collectors.toList());
    }

    private Challenge createChallengeByType(ChallengeType type, User user) {
        switch (type) {
            case STEPS:
                int targetSteps = getTargetSteps(user);
                return new Challenge(
                        "Caminar " + targetSteps + " pasos hoy",
                        20,
                        ChallengeType.STEPS,
                        targetSteps,
                        user
                );

            case ACTIVITY_DURATION:
                int targetMinutes = 30 + random.nextInt(31); // Entre 30 y 60 minutos
                return new Challenge(
                        "Realizar " + targetMinutes + " minutos de ejercicio",
                        25,
                        ChallengeType.ACTIVITY_DURATION,
                        targetMinutes,
                        user
                );

            case SLEEP_HOURS:
                double targetHours = Math.round((user.getSleepProfile().getDailyObjectiveSleep() > 0
                        ? user.getSleepProfile().getDailyObjectiveSleep()
                        : 8) * 10) / 10.0;
                return new Challenge(
                        "Dormir " + targetHours + " horas esta noche",
                        15,
                        ChallengeType.SLEEP_HOURS,
                        (int)(targetHours * 60), // Convertimos a minutos
                        user
                );

            case SLEEP_QUALITY:
                int targetQuality = 70 + random.nextInt(21); // Entre 70% y 90%
                return new Challenge(
                        "Alcanzar " + targetQuality + "% de calidad del sueño",
                        30,
                        ChallengeType.SLEEP_QUALITY,
                        targetQuality,
                        user
                );

            case HYDRATION:
                int targetWater = 2000 + random.nextInt(1001); // Entre 2000ml y 3000ml
                return new Challenge(
                        "Beber " + targetWater + "ml de agua hoy",
                        15,
                        ChallengeType.HYDRATION,
                        targetWater,
                        user
                );

            default:
                return null;
        }
    }

    private void cleanOldChallenges(User user) {
        List<Challenge> activeNonCompletedChallenges = challengeRepository.findByUserAndCompletedFalse(user);
        Calendar yesterday = Calendar.getInstance();
        yesterday.add(Calendar.DAY_OF_MONTH, -1);

        for (Challenge challenge : activeNonCompletedChallenges) {
            if (challenge.getCreationDate().before(yesterday.getTime())) {
                challengeRepository.delete(challenge);
            }
        }
    }


    private int getTargetSteps(User user) {
        // Si el usuario tiene un objetivo diario, usamos ese como base
        ActivityProfile profile = user.getActivityProfile();
        int baseSteps = 8000; // Valor por defecto

        // Verificamos si tiene pasos registrados para determinar su nivel de actividad
        if (!profile.getDailySteps().isEmpty()) {
            // Calculamos el promedio de los últimos 7 días
            Calendar lastWeek = Calendar.getInstance();
            lastWeek.add(Calendar.DAY_OF_MONTH, -7);

            int totalSteps = 0;
            int count = 0;

            for (DailySteps daily : profile.getDailySteps()) {
                if (daily.getDate().after(lastWeek.getTime())) {
                    totalSteps += daily.getSteps();
                    count++;
                }
            }

            if (count > 0) {
                baseSteps = totalSteps / count;
            }
        }

        // Generamos un reto un poco por encima de su promedio
        return baseSteps + random.nextInt(2000);
    }

    public void updateChallengeProgress(String token, ChallengeType type, int value) {
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);

        List<Challenge> activeChallenges = challengeRepository.findByUserAndTypeAndCompletedFalse(user, type);

        for (Challenge challenge : activeChallenges) {
            boolean completed = challenge.updateProgress(value);
            if (completed) {
                user.getLevel().addExperience(challenge.getExpReward());
            }
        }

        userRepository.save(user);
    }

    public List<ChallengeDTO> getUserChallenges(String token) {
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);

        Calendar yesterday = Calendar.getInstance();
        yesterday.add(Calendar.DAY_OF_MONTH, -1);

        List<Challenge> challenges = challengeRepository.findByUserAndCreationDateAfter(user, yesterday.getTime());
        return challenges.stream()
                .map(ChallengeDTO::new)
                .collect(Collectors.toList());
    }
}
package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.HydrationStatusDTO;
import com.tecnocampus.backendtfg.application.dto.HydrationUpdateRequest;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.ChallengeType;
import com.tecnocampus.backendtfg.domain.Gender;
import com.tecnocampus.backendtfg.domain.Hydration;
import com.tecnocampus.backendtfg.domain.HydrationProfile;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.HydrationProfileRepository;
import com.tecnocampus.backendtfg.persistence.HydrationRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;

@Service
public class HydrationService {

    private final UserRepository userRepository;
    private final HydrationRepository hydrationRepository;
    private final HydrationProfileRepository hydrationProfileRepository;
    private final JwtUtils jwtUtils;
    private final ChallengeService challengeService;

    public HydrationService(UserRepository userRepository,
                            HydrationRepository hydrationRepository,
                            HydrationProfileRepository hydrationProfileRepository,
                            JwtUtils jwtUtils,
                            ChallengeService challengeService) {
        this.userRepository = userRepository;
        this.hydrationRepository = hydrationRepository;
        this.hydrationProfileRepository = hydrationProfileRepository;
        this.jwtUtils = jwtUtils;
        this.challengeService = challengeService;
    }

    public HydrationStatusDTO getHydrationStatus(String token) {
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);

        HydrationProfile hydrationProfile = hydrationProfileRepository.findByUser(user);

        // Calcular objetivo diario de hidratación externamente
        double dailyTarget = calculateDailyObjective(user);
        hydrationProfile.setDailyObjectiveWater(dailyTarget);

        // Verificar si es un nuevo día para resetear
        if (isNewDay(hydrationProfile.getLastUpdate())) {
            hydrationProfile.resetDailyAmount();
            hydrationProfileRepository.save(hydrationProfile);
        }

        return new HydrationStatusDTO(
                hydrationProfile.getDailyObjectiveWater(),
                hydrationProfile.getCurrentAmount(),
                hydrationProfile.getLastUpdate()
        );
    }

    public void updateHydration(String token, HydrationUpdateRequest updateRequest) {
        String email = jwtUtils.extractEmail(token);
        User user = userRepository.findByEmail(email);

        HydrationProfile profile = hydrationProfileRepository.findByUser(user);

        // Verificar si es un nuevo día
        if (isNewDay(profile.getLastUpdate())) {
            profile.resetDailyAmount();
        }

        // Crear nueva entrada de hidratación con la fecha actual
        Date currentDate = new Date();

        Hydration hydration = new Hydration(
                updateRequest.getAmount(),
                currentDate,
                profile
        );

        // Actualizar perfil y guardar solo a través del perfil
        // Aprovechamos la cascada configurada en HydrationProfile
        profile.addHydration(hydration);
        hydrationProfileRepository.save(profile);
        challengeService.updateChallengeProgress(token, ChallengeType.HYDRATION, (int)(updateRequest.getAmount() * 1000));
    }

    private double calculateDailyObjective(User user) {
        // Fórmula básica: Peso (kg) * 0.033 litros (33 ml por kg)
        if (user.getWeight() != null) {
            double baseAmount = user.getWeight() * 0.033;

            // Ajuste por edad (los mayores necesitan más)
            if (user.getAge() > 30) {
                baseAmount *= 1.1;
            }

            // Ajuste por género
            if (user.getGender() == Gender.MALE) {
                baseAmount *= 1.1;
            }

            return Math.round(baseAmount * 100) / 100.0;
        } else {
            // Valor por defecto si no hay peso registrado (2.5 litros)
            return 2.5;
        }
    }

    private boolean isNewDay(Date lastUpdate) {
        if (lastUpdate == null) return true;

        Calendar cal1 = Calendar.getInstance();
        Calendar cal2 = Calendar.getInstance();
        cal2.setTime(lastUpdate);

        return cal1.get(Calendar.DAY_OF_YEAR) != cal2.get(Calendar.DAY_OF_YEAR)
                || cal1.get(Calendar.YEAR) != cal2.get(Calendar.YEAR);
    }
}
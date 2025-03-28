package com.tecnocampus.backendtfg.component;


import com.tecnocampus.backendtfg.domain.Gender;
import com.tecnocampus.backendtfg.domain.TypeActivity;
import com.tecnocampus.backendtfg.domain.User;

public class CalorieCalculator {

    public static double calculateCaloriesBurned(User user, TypeActivity activityType, double durationInMinutes) {
        if (user == null || user.getWeight() == null) {
            return 0;
        }

        // Get MET value for activity type
        double metValue = getMETValueForActivity(activityType);

        // Formula: Calories = MET * weight(kg) * duration(hours)
        double durationInHours = durationInMinutes / 60.0;
        double weight = user.getWeight();

        double calories;
        if (user.getGender() == null) {
            calories = metValue * weight * durationInHours;
        } else {
            // Apply gender adjustment if available (typically 10% lower for females)
            double genderFactor = (user.getGender() == Gender.FEMALE) ? 0.9 : 1.0;
            calories = metValue * weight * durationInHours * genderFactor;
        }

        // Round to one decimal place
        return Math.round(calories * 10.0) / 10.0;
    }
    private static double getMETValueForActivity(TypeActivity type) {
        // MET values from Compendium of Physical Activities
        switch (type) {
            case RUNNING: return 9.8;
            case WALKING: return 3.5;
            case CYCLING: return 7.5;
            case SWIMMING: return 7.0;
            case HIKING: return 6.0;
            case YOGA: return 2.5;
            case PILATES: return 3.0;
            case STRENGTH_TRAINING: return 5.0;
            case CLIMBING: return 8.0;
            case HIIT: return 8.0;
            case CROSSFIT: return 7.0;
            case SPINNING: return 8.5;
            case DANCE: return 4.8;
            case BOXING: return 7.5;
            case KICKBOXING: return 8.0;
            case RACKET: return 7.0;
            case FOOTBALL: return 7.0;
            case TRIATHLON: return 10.0;
            case AEROBICS: return 6.5;
            case BADMINTON: return 5.5;
            case BASEBALL: return 5.0;
            case BASKETBALL: return 6.5;
            case BIKING: return 7.5;
            case BIKING_STATIONARY: return 7.0;
            case BOOT_CAMP: return 8.0;
            case CALISTHENICS: return 4.0;
            case CRICKET: return 5.0;
            case DANCING: return 4.8;
            case ELLIPTICAL: return 5.0;
            case FENCING: return 6.0;
            case FOOTBALL_AMERICAN: return 8.0;
            case FRISBEE_DISC: return 3.0;
            case GOLF: return 4.5;
            case GUIDED_BREATHING: return 1.0;
            case GYMNASTICS: return 3.8;
            case HANDBALL: return 8.0;
            case HIGH_INTENSITY_INTERVAL_TRAINING: return 8.0;
            case ICE_HOCKEY: return 8.0;
            case ICE_SKATING: return 5.5;
            case MARTIAL_ARTS: return 6.5;
            case PADDLING: return 5.0;
            case PARAGLIDING: return 1.5;
            case RACQUETBALL: return 7.0;
            case ROCK_CLIMBING: return 8.0;
            case ROLLER_HOCKEY: return 7.5;
            case ROWING: return 7.0;
            case ROWING_MACHINE: return 7.0;
            case RUGBY: return 8.3;
            case RUNNING_TREADMILL: return 9.0;
            case SAILING: return 3.0;
            case SCUBA_DIVING: return 7.0;
            case SKATING: return 7.0;
            case SKIING: return 7.0;
            case SNOWBOARDING: return 5.3;
            case SNOWSHOEING: return 5.3;
            case SOCCER: return 7.0;
            case SOFTBALL: return 5.0;
            case SQUASH: return 7.3;
            case STAIR_CLIMBING: return 9.0;
            case STAIR_CLIMBING_MACHINE: return 9.0;
            case STRETCHING: return 2.3;
            case SURFING: return 3.5;
            case SWIMMING_OPEN_WATER: return 7.0;
            case SWIMMING_POOL: return 6.0;
            case TABLE_TENNIS: return 4.0;
            case TENNIS: return 7.3;
            case VOLLEYBALL: return 4.0;
            case WATER_POLO: return 10.0;
            case WEIGHTLIFTING: return 6.0;
            case WHEELCHAIR: return 2.5;
            default: return 4.0;
        }
    }
}

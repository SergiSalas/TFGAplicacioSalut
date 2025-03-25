package com.tecnocampus.backendtfg.application.mapper;

import com.tecnocampus.backendtfg.domain.TypeActivity;

public class HealthConnectMapper {

    public static TypeActivity mapExerciseTypeToTypeActivity(String exerciseType) {
        if (exerciseType == null) {
            return TypeActivity.WALKING;  // Default value
        }

        switch (exerciseType) {
            case "EXERCISE_TYPE_AEROBICS":
                return TypeActivity.AEROBICS;
            case "EXERCISE_TYPE_BADMINTON":
                return TypeActivity.BADMINTON;
            case "EXERCISE_TYPE_BASEBALL":
                return TypeActivity.BASEBALL;
            case "EXERCISE_TYPE_BASKETBALL":
                return TypeActivity.BASKETBALL;
            case "EXERCISE_TYPE_BIKING":
                return TypeActivity.BIKING;
            case "EXERCISE_TYPE_BIKING_STATIONARY":
                return TypeActivity.BIKING_STATIONARY;
            case "EXERCISE_TYPE_BOOT_CAMP":
                return TypeActivity.BOOT_CAMP;
            case "EXERCISE_TYPE_BOXING":
                return TypeActivity.BOXING;
            case "EXERCISE_TYPE_CALISTHENICS":
                return TypeActivity.CALISTHENICS;
            case "EXERCISE_TYPE_CRICKET":
                return TypeActivity.CRICKET;
            case "EXERCISE_TYPE_DANCING":
                return TypeActivity.DANCING;
            case "EXERCISE_TYPE_ELLIPTICAL":
                return TypeActivity.ELLIPTICAL;
            case "EXERCISE_TYPE_FENCING":
                return TypeActivity.FENCING;
            case "EXERCISE_TYPE_FOOTBALL_AMERICAN":
                return TypeActivity.FOOTBALL_AMERICAN;
            case "EXERCISE_TYPE_FOOTBALL":
                return TypeActivity.FOOTBALL;
            case "EXERCISE_TYPE_FRISBEE_DISC":
                return TypeActivity.FRISBEE_DISC;
            case "EXERCISE_TYPE_GOLF":
                return TypeActivity.GOLF;
            case "EXERCISE_TYPE_GUIDED_BREATHING":
                return TypeActivity.GUIDED_BREATHING;
            case "EXERCISE_TYPE_GYMNASTICS":
                return TypeActivity.GYMNASTICS;
            case "EXERCISE_TYPE_HANDBALL":
                return TypeActivity.HANDBALL;
            case "EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING":
                return TypeActivity.HIGH_INTENSITY_INTERVAL_TRAINING;
            case "EXERCISE_TYPE_HIKING":
                return TypeActivity.HIKING;
            case "EXERCISE_TYPE_ICE_HOCKEY":
                return TypeActivity.ICE_HOCKEY;
            case "EXERCISE_TYPE_ICE_SKATING":
                return TypeActivity.ICE_SKATING;
            case "EXERCISE_TYPE_MARTIAL_ARTS":
                return TypeActivity.MARTIAL_ARTS;
            case "EXERCISE_TYPE_PADDLING":
                return TypeActivity.PADDLING;
            case "EXERCISE_TYPE_PARAGLIDING":
                return TypeActivity.PARAGLIDING;
            case "EXERCISE_TYPE_PILATES":
                return TypeActivity.PILATES;
            case "EXERCISE_TYPE_RACQUETBALL":
                return TypeActivity.RACQUETBALL;
            case "EXERCISE_TYPE_ROCK_CLIMBING":
                return TypeActivity.ROCK_CLIMBING;
            case "EXERCISE_TYPE_ROLLER_HOCKEY":
                return TypeActivity.ROLLER_HOCKEY;
            case "EXERCISE_TYPE_ROWING":
                return TypeActivity.ROWING;
            case "EXERCISE_TYPE_ROWING_MACHINE":
                return TypeActivity.ROWING_MACHINE;
            case "EXERCISE_TYPE_RUGBY":
                return TypeActivity.RUGBY;
            case "EXERCISE_TYPE_RUNNING":
                return TypeActivity.RUNNING;
            case "EXERCISE_TYPE_RUNNING_TREADMILL":
                return TypeActivity.RUNNING_TREADMILL;
            case "EXERCISE_TYPE_SAILING":
                return TypeActivity.SAILING;
            case "EXERCISE_TYPE_SCUBA_DIVING":
                return TypeActivity.SCUBA_DIVING;
            case "EXERCISE_TYPE_SKATING":
                return TypeActivity.SKATING;
            case "EXERCISE_TYPE_SKIING":
                return TypeActivity.SKIING;
            case "EXERCISE_TYPE_SNOWBOARDING":
                return TypeActivity.SNOWBOARDING;
            case "EXERCISE_TYPE_SNOWSHOEING":
                return TypeActivity.SNOWSHOEING;
            case "EXERCISE_TYPE_SOCCER":
                return TypeActivity.SOCCER;
            case "EXERCISE_TYPE_SOFTBALL":
                return TypeActivity.SOFTBALL;
            case "EXERCISE_TYPE_SQUASH":
                return TypeActivity.SQUASH;
            case "EXERCISE_TYPE_STAIR_CLIMBING":
                return TypeActivity.STAIR_CLIMBING;
            case "EXERCISE_TYPE_STAIR_CLIMBING_MACHINE":
                return TypeActivity.STAIR_CLIMBING_MACHINE;
            case "EXERCISE_TYPE_STRENGTH_TRAINING":
                return TypeActivity.STRENGTH_TRAINING;
            case "EXERCISE_TYPE_STRETCHING":
                return TypeActivity.STRETCHING;
            case "EXERCISE_TYPE_SURFING":
                return TypeActivity.SURFING;
            case "EXERCISE_TYPE_SWIMMING_OPEN_WATER":
                return TypeActivity.SWIMMING_OPEN_WATER;
            case "EXERCISE_TYPE_SWIMMING_POOL":
                return TypeActivity.SWIMMING_POOL;
            case "EXERCISE_TYPE_TABLE_TENNIS":
                return TypeActivity.TABLE_TENNIS;
            case "EXERCISE_TYPE_TENNIS":
                return TypeActivity.TENNIS;
            case "EXERCISE_TYPE_VOLLEYBALL":
                return TypeActivity.VOLLEYBALL;
            case "EXERCISE_TYPE_WALKING":
                return TypeActivity.WALKING;
            case "EXERCISE_TYPE_WATER_POLO":
                return TypeActivity.WATER_POLO;
            case "EXERCISE_TYPE_WEIGHTLIFTING":
                return TypeActivity.WEIGHTLIFTING;
            case "EXERCISE_TYPE_WHEELCHAIR":
                return TypeActivity.WHEELCHAIR;
            case "EXERCISE_TYPE_YOGA":
                return TypeActivity.YOGA;
            default:
                return TypeActivity.WALKING;
        }
    }
}
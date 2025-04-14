package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.application.dto.DailyStepsDTO;
import com.tecnocampus.backendtfg.domain.ActivityProfile;
import com.tecnocampus.backendtfg.domain.DailySteps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface DailyStepsRepository extends JpaRepository<DailySteps, Long> {

    DailySteps findByDate(Date date);

    // Usando FORMATDATETIME para H2
    @Query("SELECT ds FROM DailySteps ds WHERE FORMATDATETIME(ds.date, 'yyyy-MM-dd') = FORMATDATETIME(:date, 'yyyy-MM-dd')")
    DailySteps findByDay(@Param("date") Date date);

    // Consulta para DTO usando el mismo enfoque
    @Query("SELECT new com.tecnocampus.backendtfg.application.dto.DailyStepsDTO(ds.steps, ds.date, ds.duration) " +
            "FROM DailySteps ds WHERE FORMATDATETIME(ds.date, 'yyyy-MM-dd') = FORMATDATETIME(:date, 'yyyy-MM-dd') " +
            "AND ds.activityProfile = :activityProfile")
    DailyStepsDTO getDailyStepsDTOByDateAndActivityProfile(@Param("date") Date date, @Param("activityProfile") ActivityProfile activityProfile);
}
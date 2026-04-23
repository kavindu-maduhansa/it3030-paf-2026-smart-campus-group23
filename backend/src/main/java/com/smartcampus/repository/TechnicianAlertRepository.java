package com.smartcampus.repository;

import com.smartcampus.model.TechnicianAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicianAlertRepository extends MongoRepository<TechnicianAlert, String> {
    List<TechnicianAlert> findAllByOrderByCreatedAtDesc();
}

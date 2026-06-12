package com.flowfi.repository;

import com.flowfi.model.Debt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebtRepository extends MongoRepository<Debt, String> {
    List<Debt> findByUserId(String userId);
}

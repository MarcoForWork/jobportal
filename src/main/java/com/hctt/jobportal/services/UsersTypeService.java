package com.hctt.jobportal.services;

import org.springframework.stereotype.Service;

import com.hctt.jobportal.entity.UsersType;
import com.hctt.jobportal.repository.UsersTypeRepository;

import java.util.List;

@Service
public class UsersTypeService {

    private final UsersTypeRepository usersTypeRepository;

    public UsersTypeService(UsersTypeRepository usersTypeRepository) {
        this.usersTypeRepository = usersTypeRepository;
    }

    public List<UsersType> getAll() {
        return usersTypeRepository.findAll();
    }
}

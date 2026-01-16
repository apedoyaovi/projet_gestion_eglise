package com.apedo.gestion_eglise.controllers;

import com.apedo.gestion_eglise.entities.ChurchConfig;
import com.apedo.gestion_eglise.repositories.ChurchConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/church-config")
public class ChurchConfigController {

    @Autowired
    private ChurchConfigRepository repository;

    @GetMapping
    public ChurchConfig getConfig() {
        List<ChurchConfig> configs = repository.findAll();
        if (configs.isEmpty()) {
            return new ChurchConfig(null, "Temple Emmanuel", "Lomé, Togo", "+228 XX XX XX XX",
                    "contact@temple-emmanuel.org");
        }
        return configs.get(0);
    }

    @PostMapping
    public ChurchConfig updateConfig(@RequestBody ChurchConfig config) {
        List<ChurchConfig> configs = repository.findAll();
        if (!configs.isEmpty()) {
            config.setId(configs.get(0).getId());
        }
        return repository.save(config);
    }
}

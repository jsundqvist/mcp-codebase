package com.example.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/**
 * Repository interface for data access operations
 */
public interface Repository<T, ID> {
    CompletableFuture<Optional<T>> findById(ID id);
    CompletableFuture<List<T>> findAll();
    CompletableFuture<T> save(T entity);
    CompletableFuture<Void> delete(ID id);
}

/**
 * In-memory implementation of the Repository interface
 */
public class InMemoryRepository<T extends Entity<ID>, ID> implements Repository<T, ID> {
    private final List<T> entities;
    private final Class<T> entityClass;

    public InMemoryRepository(Class<T> entityClass) {
        this.entities = new ArrayList<>();
        this.entityClass = entityClass;
    }

    @Override
    public CompletableFuture<Optional<T>> findById(ID id) {
        return CompletableFuture.supplyAsync(() -> 
            entities.stream()
                   .filter(e -> e.getId().equals(id))
                   .findFirst()
        );
    }

    @Override
    public CompletableFuture<List<T>> findAll() {
        return CompletableFuture.completedFuture(
            new ArrayList<>(entities)
        );
    }

    @Override
    public CompletableFuture<T> save(T entity) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                int index = entities.indexOf(entity);
                if (index >= 0) {
                    entities.set(index, entity);
                } else {
                    entities.add(entity);
                }
                return entity;
            } catch (Exception e) {
                throw new RepositoryException("Failed to save entity", e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> delete(ID id) {
        return CompletableFuture.runAsync(() -> {
            entities.removeIf(e -> e.getId().equals(id));
        });
    }

    protected void validateEntity(T entity) throws ValidationException {
        if (entity == null) {
            throw new ValidationException("Entity cannot be null");
        }
        if (entity.getId() == null) {
            throw new ValidationException("Entity ID cannot be null");
        }
    }
}

/**
 * Custom exception for repository operations
 */
public class RepositoryException extends RuntimeException {
    public RepositoryException(String message) {
        super(message);
    }

    public RepositoryException(String message, Throwable cause) {
        super(message, cause);
    }
}

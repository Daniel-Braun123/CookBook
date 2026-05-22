package de.cookBook.backend.config;

import de.cookBook.backend.entities.*;
import de.cookBook.backend.service.RecipeEventService;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Set;

/**
 * Global JPA entity listener that automatically broadcasts SSE events
 * after any tracked entity is created, updated, or deleted.
 * Registered for all entities via META-INF/orm.xml.
 */
@Component
public class EntityChangeListener {

    private final RecipeEventService sseService;

    /**
     * Entities whose changes should be broadcast to connected clients.
     * Sub-entities (Ingredients, CookingSteps, NutritionInfo) are excluded
     * because their parent Recipe entity is updated in the same transaction.
     */
    private static final Set<Class<?>> TRACKED = Set.of(
            Recipes.class,
            Users.class,
            Review.class,
            Categories.class
    );

    public EntityChangeListener(RecipeEventService sseService) {
        this.sseService = sseService;
    }

    @PostPersist
    public void onPostPersist(Object entity) {
        broadcastAfterCommit(entity, "CREATED");
    }

    @PostUpdate
    public void onPostUpdate(Object entity) {
        broadcastAfterCommit(entity, "UPDATED");
    }

    @PostRemove
    public void onPostRemove(Object entity) {
        broadcastAfterCommit(entity, "DELETED");
    }

    private void broadcastAfterCommit(Object entity, String action) {
        if (!TRACKED.contains(entity.getClass())) return;

        String entityName = entity.getClass().getSimpleName();
        Long id = extractId(entity);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            sseService.broadcastChange(entityName, action, id);
                        }
                    }
            );
        } else {
            sseService.broadcastChange(entityName, action, id);
        }
    }

    private Long extractId(Object entity) {
        if (entity instanceof Recipes r) return r.getId();
        if (entity instanceof Users u) return u.getId();
        if (entity instanceof Review r) return r.getId();
        if (entity instanceof Categories c) return c.getId();
        return null;
    }
}

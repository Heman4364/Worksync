package com.worksync.repository;

import com.worksync.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    @Query("SELECT tc FROM TaskComment tc JOIN FETCH tc.author WHERE tc.task.id = :taskId ORDER BY tc.createdAt ASC")
    List<TaskComment> findByTaskIdWithAuthor(@Param("taskId") Long taskId);
}

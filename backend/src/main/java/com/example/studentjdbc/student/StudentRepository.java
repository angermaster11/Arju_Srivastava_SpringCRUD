package com.example.studentjdbc.student;

import java.util.List;
import java.util.Optional;

public interface StudentRepository {
	Student create(Student student);

	List<Student> findAll();

	Optional<Student> findById(int id);

	boolean update(int id, Student student);

	boolean deleteById(int id);
}

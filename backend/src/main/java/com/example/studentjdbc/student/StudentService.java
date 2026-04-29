package com.example.studentjdbc.student;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
	private final StudentRepository repository;

	public StudentService(StudentRepository repository) {
		this.repository = repository;
	}

	public Student create(Student student) {
		validate(student);
		return repository.create(student);
	}

	public List<Student> findAll() {
		return repository.findAll();
	}

	public Student findById(int id) {
		return repository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
	}

	public Student update(int id, Student student) {
		validate(student);
		boolean updated = repository.update(id, student);
		if (!updated) {
			throw new StudentNotFoundException(id);
		}
		return new Student(id, student.getName(), student.getEmail(), student.getCourse());
	}

	public void deleteById(int id) {
		boolean deleted = repository.deleteById(id);
		if (!deleted) {
			throw new StudentNotFoundException(id);
		}
	}

	private static void validate(Student student) {
		if (student == null) {
			throw new IllegalArgumentException("Student body is required");
		}
		if (isBlank(student.getName())) {
			throw new IllegalArgumentException("name is required");
		}
		if (isBlank(student.getEmail())) {
			throw new IllegalArgumentException("email is required");
		}
		if (isBlank(student.getCourse())) {
			throw new IllegalArgumentException("course is required");
		}
	}

	private static boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}

package com.example.studentjdbc.student;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JdbcStudentRepository implements StudentRepository {
	private final JdbcTemplate jdbcTemplate;
	private final StudentRowMapper rowMapper = new StudentRowMapper();

	public JdbcStudentRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	public Student create(Student student) {
		Integer id = jdbcTemplate.queryForObject(
			"INSERT INTO students(name, email, course) VALUES (?, ?, ?) RETURNING id",
			Integer.class,
			student.getName(),
			student.getEmail(),
			student.getCourse()
		);
		if (id == null) {
			throw new IllegalStateException("Insert succeeded but returned id was null");
		}
		return new Student(id, student.getName(), student.getEmail(), student.getCourse());
	}

	@Override
	public List<Student> findAll() {
		return jdbcTemplate.query(
			"SELECT id, name, email, course FROM students ORDER BY id",
			rowMapper
		);
	}

	@Override
	public Optional<Student> findById(int id) {
		List<Student> result = jdbcTemplate.query(
			"SELECT id, name, email, course FROM students WHERE id = ?",
			rowMapper,
			id
		);
		return result.stream().findFirst();
	}

	@Override
	public boolean update(int id, Student student) {
		int updated = jdbcTemplate.update(
			"UPDATE students SET name = ?, email = ?, course = ? WHERE id = ?",
			student.getName(),
			student.getEmail(),
			student.getCourse(),
			id
		);
		return updated > 0;
	}

	@Override
	public boolean deleteById(int id) {
		int deleted = jdbcTemplate.update("DELETE FROM students WHERE id = ?", id);
		return deleted > 0;
	}
}

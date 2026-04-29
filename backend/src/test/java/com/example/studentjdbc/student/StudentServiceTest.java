package com.example.studentjdbc.student;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class StudentServiceTest {

	@Test
	void findByIdThrowsWhenMissing() {
		StudentService service = new StudentService(new InMemoryRepo());
		assertThrows(StudentNotFoundException.class, () -> service.findById(123));
	}

	@Test
	void createValidatesRequiredFields() {
		StudentService service = new StudentService(new InMemoryRepo());
		assertThrows(IllegalArgumentException.class, () -> service.create(new Student(null, "", "a@b.com", "CS")));
		assertThrows(IllegalArgumentException.class, () -> service.create(new Student(null, "Ada", "", "CS")));
		assertThrows(IllegalArgumentException.class, () -> service.create(new Student(null, "Ada", "a@b.com", "")));
	}

	static class InMemoryRepo implements StudentRepository {
		private int nextId = 1;
		private final List<Student> students = new ArrayList<>();

		@Override
		public Student create(Student student) {
			Student created = new Student(nextId++, student.getName(), student.getEmail(), student.getCourse());
			students.add(created);
			return created;
		}

		@Override
		public List<Student> findAll() {
			return List.copyOf(students);
		}

		@Override
		public Optional<Student> findById(int id) {
			return students.stream().filter(s -> s.getId() == id).findFirst();
		}

		@Override
		public boolean update(int id, Student student) {
			for (int i = 0; i < students.size(); i++) {
				if (students.get(i).getId() == id) {
					students.set(i, new Student(id, student.getName(), student.getEmail(), student.getCourse()));
					return true;
				}
			}
			return false;
		}

		@Override
		public boolean deleteById(int id) {
			return students.removeIf(s -> s.getId() == id);
		}
	}
}

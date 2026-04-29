package com.example.studentjdbc.student;

public class StudentNotFoundException extends RuntimeException {
	public StudentNotFoundException(int id) {
		super("Student not found: " + id);
	}
}

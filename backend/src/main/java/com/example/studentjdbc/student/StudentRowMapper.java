package com.example.studentjdbc.student;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class StudentRowMapper implements RowMapper<Student> {

	@Override
	public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
		return new Student(
			rs.getInt("id"),
			rs.getString("name"),
			rs.getString("email"),
			rs.getString("course")
		);
	}
}

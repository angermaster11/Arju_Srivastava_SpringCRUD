package com.example.studentjdbc.student;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {
	private final StudentService service;

	public StudentController(StudentService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<Student> create(@RequestBody Student student, UriComponentsBuilder uriBuilder) {
		Student created = service.create(student);
		URI location = uriBuilder.path("/students/{id}").buildAndExpand(created.getId()).toUri();
		return ResponseEntity.created(location).body(created);
	}

	@GetMapping
	public List<Student> findAll() {
		return service.findAll();
	}

	@GetMapping("/{id}")
	public Student findById(@PathVariable int id) {
		return service.findById(id);
	}

	@PutMapping("/{id}")
	public Student update(@PathVariable int id, @RequestBody Student student) {
		return service.update(id, student);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteById(@PathVariable int id) {
		service.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}

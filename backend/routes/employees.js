const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees or filter employees
router.get('/', async (req, res) => {
  try {
    const { employeeId, name, department, dateFrom, dateTo } = req.query;
    let query = {};

    // Filter by employee ID
    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Filter by name (first or last name)
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by date of joining range
    if (dateFrom && dateTo) {
      query.dateOfJoining = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    const employees = await Employee.find(query);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error });
  }
});

// Add a new employee
router.post('/', async (req, res) => {
  const {
    employeeId,
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    department,
    position,
    dateOfJoining,
    salary
  } = req.body;

  try {
    const newEmployee = new Employee({
      employeeId,
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      department,
      position,
      dateOfJoining,
      salary
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({ message: 'Error adding employee', error });
  }
});

// Edit an employee
router.put('/:id', async (req, res) => {
  const { id } = req.params; // Use the MongoDB _id from the route parameter
  const updateData = req.body;

  try {
    // Use the correct MongoDB _id to find and update the employee
    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
    });
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: 'Error updating employee', error });
  }
});


// Delete an employee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Employee.findByIdAndDelete(id);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting employee', error });
  }
});


// Search employees
router.get('/search', async (req, res) => {
  const { employeeId, name, department, startDate, endDate } = req.query;
  
  let filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (name) filter.$or = [
    { firstName: new RegExp(name, 'i') },
    { lastName: new RegExp(name, 'i') }
  ];
  if (department) filter.department = department;
  
  
  try {
    const employees = await Employee.find(filter);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

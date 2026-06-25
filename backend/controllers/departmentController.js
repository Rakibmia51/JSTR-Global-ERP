const Department = require('../models/Department');

// ১. সকল ডিপার্টমেন্ট গেট করা (Get All Departments)
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 }); // নাম অনুযায়ী অ্যালফাবেটিকালি সর্ট হবে
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ২. নতুন ডিপার্টমেন্ট তৈরি করা (Create Department)
const createDepartment = async (req, res) => {
  try {
    const newDept = await Department.create(req.body);
    res.status(201).json({ success: true, message: 'Department created!', data: newDept });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ১. ডিপার্টমেন্ট আপডেট করা (Update Department)
const updateDepartment = async (req, res) => {
  try {
    const updatedDept = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, message: 'Department updated!', data: updatedDept });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ২. ডিপার্টমেন্ট ডিলিট করা (Delete Department)
const deleteDepartment = async (req, res) => {
  try {
    const deletedDept = await Department.findByIdAndDelete(req.params.id);
    if (!deletedDept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, message: 'Department deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment };

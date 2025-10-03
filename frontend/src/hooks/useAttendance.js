import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Users, CheckCircle, XCircle, AlertCircle,
  Search, Filter, Download, Plus, Edit, Trash2
} from 'lucide-react';

// Import our new API services
import AttendanceService from '../api/services/attendanceService';
import StaffService from '../api/services/staffService';
import DepartmentService from '../api/services/departmentService';
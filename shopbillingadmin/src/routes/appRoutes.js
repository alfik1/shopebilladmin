// src/routes/appRoutes.js

export const APP_ROUTES = {
  login: '/login',
  home: '/',
  history: '/history',
  stock: '/stock',
  collection: '/collection',
  profile: '/profile',
  addEmployee: '/add-employee',
  employeeSalary: (id) => `/employees/${id}/salary`,
};
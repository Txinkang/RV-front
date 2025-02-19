import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import BookingVehicle from '../views/Vehicle/BookingVehicle.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/booking-vehicle',
    children: [
      {
        path: 'booking-vehicle',
        name: 'booking-vehicle',
        component: BookingVehicle
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
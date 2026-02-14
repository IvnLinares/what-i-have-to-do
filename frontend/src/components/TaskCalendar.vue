<template>
  <div class="calendar-view card hover-lift">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">◀️</button>
      <h3>{{ monthName }} {{ currentYear }}</h3>
      <button @click="nextMonth" class="nav-btn">▶️</button>
    </div>

    <div class="calendar-grid">
      <div v-for="dayName in dayNames" :key="dayName" class="day-name">
        {{ dayName }}
      </div>

      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-cell"
        :class="{
            'current-month': day.isCurrentMonth,
            'today': day.isToday
        }"
      >
        <div class="day-number">{{ day.dayNumber }}</div>

        <div class="day-tasks">
          <div
            v-for="task in day.tasks"
            :key="task.id"
            class="calendar-task"
            :class="[
                `priority-${task.priority}`,
                { completed: task.completed, overdue: isOverdue(task) }
            ]"
            :title="task.title"
            @click="$emit('edit-task', task)"
          >
            {{ task.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
})

defineEmits(['edit-task'])

const currentDate = ref(new Date())

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const monthName = computed(() => {
  return currentDate.value.toLocaleString('es-ES', { month: 'long' })
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []

  // Previous month days (padding)
  const prevMonthLastDate = new Date(year, month, 0)
  const prevMonthLastDay = prevMonthLastDate.getDate()

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      tasks: []
    })
  }

  // Current month days
  const today = new Date()
  for (let i = 1; i <= daysInMonth; i++) {
    // Check if today
    const isToday = (i === today.getDate() && month === today.getMonth() && year === today.getFullYear())

    // Filter tasks for this day
    const dayTasks = props.tasks.filter(task => {
        if (!task.due_date) return false
        const taskDate = new Date(task.due_date)
        return taskDate.getDate() === i &&
               taskDate.getMonth() === month &&
               taskDate.getFullYear() === year
    })

    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      isToday: isToday,
      tasks: dayTasks
    })
  }

  // Next month days (padding to complete grid)
  const remainingCells = 42 - days.length // 6 rows * 7 cols

  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      dayNumber: i,
      isCurrentMonth: false,
      isToday: false,
      tasks: []
    })
  }

  return days
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const isOverdue = (task) => {
    if (task.completed || !task.due_date) return false
    return new Date(task.due_date) < new Date()
}
</script>

<style scoped>
.calendar-view {
  margin-top: 1rem;
  padding: 1.5rem;
  /* Glass style inherited from .card */
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.calendar-header h3 {
  text-transform: capitalize;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-btn {
    background: rgba(120, 120, 128, 0.1);
    border: none;
    border-radius: 50%;
    width: 36px; height: 36px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
}
.nav-btn:hover { background: rgba(120, 120, 128, 0.2); }

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-name {
  text-align: center;
  padding: 0.5rem;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.calendar-cell {
  background-color: rgba(120, 120, 128, 0.05);
  min-height: 100px;
  padding: 6px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.calendar-cell.current-month {
  background-color: rgba(120, 120, 128, 0.1);
  opacity: 1;
}

.calendar-cell.today {
  border: 2px solid var(--primary-color);
  background-color: rgba(0, 122, 255, 0.05);
}

.day-number {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.calendar-cell.today .day-number {
    color: var(--primary-color);
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  flex: 1;
}

.calendar-task {
  font-size: 0.75rem;
  padding: 3px 6px;
  border-radius: 6px;
  background-color: var(--surface-color);
  border-left: 3px solid #ccc;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: transform 0.1s;
}

.calendar-task:hover {
    transform: scale(1.02);
    z-index: 2;
}

.calendar-task.priority-high { border-left-color: var(--danger-color); }
.calendar-task.priority-medium { border-left-color: var(--warning-color); }
.calendar-task.priority-low { border-left-color: var(--success-color); }

.calendar-task.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.calendar-task.overdue {
  background-color: rgba(255, 59, 48, 0.1);
  border-left-color: var(--danger-color);
}
</style>

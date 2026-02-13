<template>
  <div class="calendar-view card">
    <div class="calendar-header">
      <button @click="prevMonth" class="btn btn-secondary">◀️</button>
      <h3>{{ monthName }} {{ currentYear }}</h3>
      <button @click="nextMonth" class="btn btn-secondary">▶️</button>
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
  // If remainingCells is negative (e.g. 5 weeks month), loop won't run.
  // Actually 6 rows is usually enough (42 cells).
  // Sometimes 5 rows is enough (35 cells).
  // But let's fill up to 42 for consistency.

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
  margin-top: 2rem;
  padding: 1.5rem;
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
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-name {
  text-align: center;
  padding: 0.5rem;
  font-weight: bold;
  color: var(--text-muted);
}

.calendar-cell {
  background-color: var(--bg-color);
  min-height: 120px;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  opacity: 0.4;
}

.calendar-cell.current-month {
  background-color: var(--surface-color);
  opacity: 1;
}

.calendar-cell.today {
  border: 2px solid var(--primary-color);
  background-color: rgba(99, 102, 241, 0.05);
}

.day-number {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
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
  padding: 4px 6px;
  border-radius: 4px;
  background-color: var(--bg-color);
  border-left: 3px solid #ccc;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: transform 0.1s;
}

.calendar-task:hover {
    transform: scale(1.02);
}

.calendar-task.priority-high { border-left-color: var(--danger-color); }
.calendar-task.priority-medium { border-left-color: var(--warning-color); }
.calendar-task.priority-low { border-left-color: var(--success-color); }

.calendar-task.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.calendar-task.overdue {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger-color);
}
</style>

import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodosAccess()

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(
  CreateTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({    
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: CreateTodoRequest.name,
    dueDate: CreateTodoRequest.dueDate,
    done: false        
  })
}

export async function updateTodo(
  UpdateTodoRequest: UpdateTodoRequest,
  todoId: string,
  jwtToken: string
): Promise <void> {
  const userId = parseUserId(jwtToken)

   await todoAccess.updateTodo({
    name: UpdateTodoRequest.name,
    dueDate: UpdateTodoRequest.dueDate,
    done: UpdateTodoRequest.done
  }, userId,todoId)
}

export async function deleteTodo(todoId: string, jwtToken: string): Promise<void> {
  
  const userId = parseUserId(jwtToken)
  await todoAccess.deleteTodo(userId, todoId)
}

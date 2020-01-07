import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const AWSXray = require('aws-xray-sdk');
const AWS = require('aws-sdk');

const client = new AWS.DynamoDB.DocumentClient({
  service: new AWS.DynamoDB()
});

AWSXray.captureAWSClient(client.service);

export class TodosAccess {
  [x: string]: any;

  constructor(
    private readonly docClient: DocumentClient = client,
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexTodosTable = process.env.INDEX_NAME) {
  }

  //  Get All Todos of a current user (Okay)
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos of a user')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.indexTodosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  //  Create a new Todo for a current user
  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async getTodoById(userId:string, todoId: string):  Promise<TodoItem>{

    const key = {
      "userId": userId,
      "todoId": todoId
    }
    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: key
    }).promise()

    return result.Item as TodoItem
  }

  async updateTodo(todoToUpdate: TodoUpdate, userId: string, todoId: string): Promise<void> {    

    const params = {
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set #n =:name, #dD = :dueDate, #d = :done",
      ExpressionAttributeValues: {
        ":name": todoToUpdate.name,
        ":dueDate": todoToUpdate.dueDate,
        ":done": todoToUpdate.done,        
      },
      ExpressionAttributeNames: {
        "#n": "name",
        "#dD": "dueDate",
        "#d": "done",        
      },
      ReturnValues: "NONE"
    }

    await this.docClient.update(params).promise()
        
  }

  async updateTodoAttachment(userId: string, todoId: string, attachmentUrl?: string): Promise<void> {    

    const params = {
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set #at = :attachmentUrl",
      ExpressionAttributeValues: {        
        ":attachmentUrl": attachmentUrl
      },
      ExpressionAttributeNames: {        
        "#at": "attachmentUrl"
      },
      ReturnValues: "NONE"
    }

    await this.docClient.update(params).promise()
        
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    const key = {
      "userId": userId,
      "todoId": todoId
    }
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: key
    }).promise()    
  }
}


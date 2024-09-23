import express, { Request, Response } from "express";
import prisma from "../helper/clientPrism";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import AsyncHandler from "../utils/asyncHandler";
import { EmployeeSchema, PositionSchema } from "../models/zodValidation.schemas";
import { AuthServices } from "../helper/auth";
import UserService from "./user.controller";
import DepartmentService from "./department.controller";
import { newRequest } from "../types/express";
class position {
  private static async positionRequest(req: Request, res: Response){
      const parsedPosition = PositionSchema.safeParse(req.body)
      if(!parsedPosition.success){
        throw new ApiError(400, "Invalid position data");
      }

      const position = await prisma.position.create({
        data: parsedPosition.data,
      })  

      if(!position){
        throw new ApiError(500, "Failed to create position in our database");
      }

      res.status(201).json(new ApiResponse(201, position, "Position created"));
  }

  private static async getPosition(req: Request, res: Response){
      const {name} = req.body;
      if(!name){
        throw new ApiError(400, "Position name is required");
      }
      const position = await prisma.position.findFirst({
        where: { name:name },
        select: {
          id: true,
          name: true,
          desc:true,
          vacancy:true,
          employee:{
            select: {
              id: true,
              departmentId:true,
              salary:true,
            },
            where: {
              isActive: true,
            },
          }
        },
      })

      if(!position){
        throw new ApiError(404, "Position not found");
      }
      res.status(200).json(new ApiResponse(200, position, "Position found"));
  }

  private static async updatePosition(req: Request, res: Response){
    const {name, desc, vacancy} = req.body;
    if(!name && !desc && !vacancy){
        throw new ApiError(400, "All fields are required");
    }
    const position = await prisma.position.update({
      where: { name: name },
      data: {
        desc: desc,
        vacancy: vacancy,
      },
    })

    if(!position){
        throw new ApiError(404, "Position not found");
    }
    res.status(200).json(new ApiResponse(200, position, "Position updated"));
  }

  private static async updatePositionDescAndVacancy(req: Request, res: Response) {
    const { name, desc, vacancy, employeeIdsToRemove, newPositionId } = req.body;

    // Ensure all fields are provided
    if (!name || !desc || vacancy === undefined || !employeeIdsToRemove || !newPositionId) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if the number of employees to be removed exceeds the available vacancy
    const position = await prisma.position.findUnique({
        where: { name: name },
        select: {
            vacancy: true,
            employee: true,
        },
    });

    if (!position) {
        throw new ApiError(404, "Position not found");
    }

    if (employeeIdsToRemove.length < position.vacancy) {
        throw new ApiError(400, "No need to remove employees");
    }

    // Remove employees from the current position and assign them a new position
    await prisma.employee.updateMany({
        where: {
            id: { in: employeeIdsToRemove },
            position: { name: name } // Ensure we're only updating employees associated with this position
        },
        data: {
            positionId: newPositionId, // Assign a new position to the employees
        },
    });

    // Update the position details
    const updatedPosition = await prisma.position.update({
        where: { name: name },
        data: {
            desc: desc,
            vacancy: vacancy,
        },
    });

    res.status(200).json(new ApiResponse(200, updatedPosition, "Position updated"));
}


  private static async deletePositionAndAddNew(req: Request, res: Response) {
  const { id } = req.params;
  const { newPositionName, vacancy } = req.body;

  // Validate the ID
  if (!id) {
      throw new ApiError(400, "Position ID is required");
  }

  // Find the position to ensure it exists
  const position = await prisma.position.findUnique({
      where: { id: id },
      include: { employee: true } // Include employees to update their status
  });

  if (!position) {
      throw new ApiError(404, "Position not found");
  }

  // Handle new position name if provided
  let newPositionId: string | undefined;
  if (newPositionName) {
      // Check if the new position already exists
      let newPosition = await prisma.position.findUnique({
          where: { name: newPositionName },
      });

      if (!newPosition) {
          // Create new position if it does not exist
          newPosition = await prisma.position.create({
              data: {
                  name: newPositionName,
                  desc: "Position created while deleting another position",
                  vacancy: vacancy, // Set vacancy according to your needs
              },
          });
      }

      newPositionId = newPosition.id;
  }

  // Check if a vacancy is provided and handle accordingly
  if (newPositionId && vacancy !== undefined) {
      // Get the list of employees in the current position
      const employees = await prisma.employee.findMany({
          where: { positionId: id },
      });

      // Check if the number of employees exceeds the vacancy
      if (employees.length > vacancy) {
          // Reassign only the number of employees equal to the vacancy
          const employeesToReassign = employees.slice(0, vacancy);

          for (const employee of employeesToReassign) {
              await prisma.employee.update({
                  where: { id: employee.id },
                  data: {
                      isActive: true,
                      positionId: newPositionId,
                  },
              });
          }

          // Set the remaining employees to isActive: false
          const employeesToDeactivate = employees.slice(vacancy);
          for (const employee of employeesToDeactivate) {
              await prisma.employee.update({
                  where: { id: employee.id },
                  data: { isActive: false },
              });
          }
      } else {
          // Reassign all employees if their number does not exceed the vacancy
          await prisma.employee.updateMany({
              where: { positionId: id },
              data: {
                  isActive: true,
                  positionId: newPositionId,
              },
          });
      }
  } else {
      // If no new position or vacancy is provided, just set isActive to false
      await prisma.employee.updateMany({
          where: { positionId: id },
          data: { isActive: false }
      });
  }

  // Delete the position
  await prisma.position.delete({
      where: { id: id }
  });

  res.status(200).json(new ApiResponse(200, null, "Position and associated employees deleted successfully"));
}


  private static async deletePosition(req: Request, res: Response) {
  const { id } = req.params;

  // Validate the ID
  if (!id) {
      throw new ApiError(400, "Position ID is required");
  }

  // Find the position to ensure it exists
  const position = await prisma.position.findUnique({
      where: { id: id },
      include: { employee: true } // Include employees to update their status
  });

  if (!position) {
      throw new ApiError(404, "Position not found");
  }

  // Update employees to set isActive to false
  await prisma.employee.updateMany({
      where: { positionId: id },
      data: { isActive: false }
  });

  // Delete the position
  await prisma.position.delete({
      where: { id: id }
  });

  res.status(200).json(new ApiResponse(200, null, "Position and associated employees deleted successfully"));
}


  private static async getPositionUsers(req: Request, res: Response) {
    try {
        // Query to get the count of employees grouped by position
        const positionEmployeeCount = await prisma.position.findMany({
            select: {
                name: true,
                _count: {
                    select: { employee: true }, // Count the number of employees
                },
            },
        });

        // Format the response
        const result = positionEmployeeCount.map(position => ({
            positionName: position.name,
            employeeCount: position._count.employee,
        }));

        res.status(200).json(new ApiResponse(200, result, "Employee count by position retrieved successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Failed to retrieve employee counts by position");
    }
 }


  static newPostion = position.positionRequest
  static getPost = position.getPosition
  static putPost = position.updatePositionDescAndVacancy
  static deletePostAndAddNew = position.deletePositionAndAddNew
  static deletePost = position.deletePosition
}

export {position}
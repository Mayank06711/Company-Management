import {Request, Response, NextFunction} from "express"
import prisma from "../helper/clientPrism"
import { DepartmentSchema } from "../models/zodValidation.schemas"
import asyncHandler from "../utils/asyncHandler"
import { newRequest } from "../types/express"
import { ApiResponse } from "../utils/apiResponse"


class DepartmentService{


    private static async newDepartment(req: Request, res: Response) {
        const parsedDepartment = DepartmentSchema.safeParse(req.body);
    
        // Check user role
        if (req.user?.role !== "Director" && req.user?.role !== "CEO") {
            return res.status(403).json(new ApiResponse(403, "You are not allowed to create department"));
        }
    
        // Validate the department data
        if (!parsedDepartment.success) {
            return res.status(400).json({ msg: "Invalid department data", errors: parsedDepartment.error.errors });
        }
    
        try {
            const newDepartment = await prisma.department.create({
                data: parsedDepartment.data,
            });
    
            return res.status(201).json({ msg: "Department created successfully", department: newDepartment });
        } 
        catch (error:any) {
            console.error("Error creating department:", error);
            return res.status(500).json({ msg: "Internal server error", error: error.message });
        }
    }
    

    private static async updateDepartment(req: Request, res: Response) {
        const { id } = req.params; // Get the department ID from the request parameters
        const parsedDepartment = DepartmentSchema.safeParse(req.body); // Validate incoming data
    
        // Check user role
        if (req.user?.role !== "Director" && req.user?.role !== "CEO") {
            return res.status(403).json({ msg: "You are not eligible" });
        }
    
        // Validate the department data
        if (!parsedDepartment.success) {
            return res.status(400).json({ msg: "Invalid department data", errors: parsedDepartment.error.errors });
        }
    
        try {
            // Update the department in the database
            const updatedDepartment = await prisma.department.update({
                where: { id }, // Find the department by ID
                data: {
                    ...parsedDepartment.data,
                    updatedAt: new Date(), // Optionally update the updatedAt field
                },
            });
    
            return res.status(200).json({ msg: "Department updated successfully", department: updatedDepartment });
        } catch (error:any) {
            if (error.code === 'P2002') { // Unique constraint violation
                return res.status(409).json({ msg: "Department name must be unique", error: error.message });
            }
            console.error("Error updating department:", error);
            return res.status(500).json({ msg: "Internal server error", error: error.message });
        }
    }
    

    private static async deleteDepartment(req:Request , res: Response) {
        const { id } = req.params; // Get the department ID from the request parameters
    
        // Check user role
        if (req.user?.role !== "Director" && req.user?.role !== "CEO") {
            return res.status(403).json({ msg: "You are not eligible" });
        }
    
        try {
            // Delete the department from the database
            const deletedDepartment = await prisma.department.delete({
                where: { id }, // Find the department by ID
            });
    
            return res.status(200).json({ msg: "Department deleted successfully", department: deletedDepartment });
        } catch (error :any) {
            if (error.code === 'P2025') { // Record not found
                return res.status(404).json({ msg: "Department not found", error: error.message });
            }
            console.error("Error deleting department:", error);
            return res.status(500).json({ msg: "Internal server error", error: error.message });
        }
    }
    
    private static async getAboutDepartment(req:Request, res:Response){
        const { id } = req.params; // Get the department ID from the request parameters
        if(id && typeof id !== 'string'){
            return res.status(400).json({ msg: "Invalid department id" });
        }
        const department = await prisma.department.findFirst({
            where: { 
                AND:[
                    { id },
                    {isActive:true}
                ]
             },
        })
        if(!department){
            return res.status(404).json({ msg: "Department not found" });
        }
        return res.status(200).json(new ApiResponse(200, {id:department.id, name:department.name, description:department.desc },"Department found"))
    }

    private static async departmentById(id:string){
        return await prisma.department.findFirst({
            where: {
                AND:[
                    { id },
                    {isActive:true}
                ]},
        })
    }

   static registerDepartment = DepartmentService.newDepartment;
   static renewDepartment = DepartmentService.updateDepartment;
   static removeDepartment = DepartmentService.deleteDepartment;
   static getDepartmentAbout = DepartmentService.getAboutDepartment;
   static getDepartmentById = DepartmentService.departmentById
}

export default DepartmentService;
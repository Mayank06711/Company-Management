import {Request, Response, NextFunction} from "express"
import prisma from "../helper/clientPrism"
import { DepartmentSchema } from "../models/zodValidation.schemas"
import asyncHandler from "../utils/asyncHandler"
import { newRequest } from "../types/express"



class DepartmentService{


    private static async newDepartment(req: newRequest, res: Response) {
        const parsedDepartment = DepartmentSchema.safeParse(req.body);
    
        
        if (req.user?.role !== "Director" && req.user?.role !== "CEO") {
            return res.status(403).json({ msg: "You are not eligible" });
        }
    
       
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
    

    private static async updateDepartment(req: newRequest, res: Response) {
        const { id } = req.params; 
        const parsedDepartment = DepartmentSchema.safeParse(req.body); 
    
        
        if (req.user?.role !== "Director" && req.user?.role !== "CEO") {
            return res.status(403).json({ msg: "You are not eligible" });
        }
    
        
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
            if (error.code === 'P2002') { 
                return res.status(409).json({ msg: "Department name must be unique", error: error.message });
            }
            console.error("Error updating department:", error);
            return res.status(500).json({ msg: "Internal server error", error: error.message });
        }
    }

    
    


    private static async deleteDepartment(req:Request , res: Response) {
        const { id } = req.params; 
    
        
        if (req.user?.role !== "Director" && req.user?.role !== "CEO") {
            return res.status(403).json({ msg: "You are not eligible" });
        }
    
        try {
           
            const deletedDepartment = await prisma.department.delete({
                where: { id }, 
            });
    
            return res.status(200).json({ msg: "Department deleted successfully", department: deletedDepartment });
        } catch (error :any) {
            if (error.code === 'P2025') { 
                return res.status(404).json({ msg: "Department not found", error: error.message });
            }
            console.error("Error deleting department:", error);
            return res.status(500).json({ msg: "Internal server error", error: error.message });
        }
    }
    

   static registerDepartment = DepartmentService.newDepartment;
}

export default DepartmentService;
import { Model, Types } from "mongoose";
import { ComplaintAudit, ComplaintAuditDocument } from "./schemas/audit.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(ComplaintAudit.name) private auditModel: Model<ComplaintAuditDocument>
  ) {}

  async logAction(action: string, complaintId: string, newValue: any, oldValue: any = null, traceId: string) {
    return this.auditModel.create({
      action,
      complaintId: new Types.ObjectId(complaintId),
      newValue,
      oldValue,
      traceId
    });
  }

  async getAuditTrail(complaintId: string) {
    return this.auditModel
      .find({ complaintId: new Types.ObjectId(complaintId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVaultItemPayload {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface IVaultItem extends Document {
  userId: Types.ObjectId;
  ciphertext: string; // base64 ciphertext of the JSON payload
  iv: string; // base64 iv used for AES
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

export const VaultItem: Model<IVaultItem> =
  mongoose.models.VaultItem || mongoose.model<IVaultItem>("VaultItem", VaultItemSchema);


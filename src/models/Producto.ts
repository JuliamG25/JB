import mongoose, { Schema, model } from 'mongoose';

export interface IProducto {
  _id?: string;
  nombre: string;
  precio: number;
  cantidad: number;
  costo: number;
  codigoBarras?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductoSchema = new Schema<IProducto>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio debe ser mayor o igual a 0'],
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es requerida'],
      min: [0, 'La cantidad debe ser mayor o igual a 0'],
    },
    costo: {
      type: Number,
      required: [true, 'El costo es requerido'],
      min: [0, 'El costo debe ser mayor o igual a 0'],
    },
    codigoBarras: {
      type: String,
      trim: true,
      sparse: true, // Permite valores únicos pero permite null/undefined
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Producto = mongoose.models.Producto || model<IProducto>('Producto', ProductoSchema);


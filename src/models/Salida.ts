import mongoose, { Schema, model } from 'mongoose';

export interface IItemSalida {
  producto: mongoose.Types.ObjectId;
  cantidad: number;
  precio: number;
}

export interface ISalida {
  _id?: string;
  productos: IItemSalida[];
  fecha: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ItemSalidaSchema = new Schema<IItemSalida>(
  {
    producto: {
      type: Schema.Types.ObjectId,
      ref: 'Producto',
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser mayor a 0'],
    },
    precio: {
      type: Number,
      required: true,
      min: [0, 'El precio debe ser mayor o igual a 0'],
    },
  },
  { _id: false }
);

const SalidaSchema = new Schema<ISalida>(
  {
    productos: {
      type: [ItemSalidaSchema],
      required: true,
      validate: {
        validator: (v: IItemSalida[]) => v.length > 0,
        message: 'Debe haber al menos un producto en la salida',
      },
    },
    fecha: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Salida = mongoose.models.Salida || model<ISalida>('Salida', SalidaSchema);


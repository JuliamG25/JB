import mongoose, { Schema, model } from 'mongoose';

export interface IItemEntrada {
  producto: mongoose.Types.ObjectId;
  cantidad: number;
  costo: number;
}

export interface IEntrada {
  _id?: string;
  productos: IItemEntrada[];
  fecha: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ItemEntradaSchema = new Schema<IItemEntrada>(
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
    costo: {
      type: Number,
      required: true,
      min: [0, 'El costo debe ser mayor o igual a 0'],
    },
  },
  { _id: false }
);

const EntradaSchema = new Schema<IEntrada>(
  {
    productos: {
      type: [ItemEntradaSchema],
      required: true,
      validate: {
        validator: (v: IItemEntrada[]) => v.length > 0,
        message: 'Debe haber al menos un producto en la entrada',
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

export const Entrada = mongoose.models.Entrada || model<IEntrada>('Entrada', EntradaSchema);


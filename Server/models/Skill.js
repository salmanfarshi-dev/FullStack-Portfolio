import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      maxlength: 50,
    },

    category: {
      type: String,
      required: [true, "Skill category is required"],
      enum: ["frontend", "backend", "database", "tools", "other"],
    },

    level: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 70,
    },

    icon: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

skillSchema.index({
  category: 1,
  isVisible: 1,
  displayOrder: 1,
});

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;

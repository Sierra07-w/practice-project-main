const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../database/mongo");

const router = express.Router();
const auth=require("../middleware/auth")

router.get("/", async (req, res) => {
try {
    const db = await connectDB();
    const { exercise, sortBy, fields } = req.query;

    const filter = exercise ? { exercise } : {};
    const sort = sortBy ? { [sortBy]: 1 } : {};
    const projection = fields
    ? fields.split(",").reduce((acc, f) => {
        acc[f] = 1;
        return acc;
        }, {})
    : {};

    const workouts = await db
    .collection("workouts")
    .find(filter)
    .sort(sort)
    .project(projection)
    .toArray();

    res.status(200).json(workouts);
} catch (err) {
    res.status(500).json({ error: "Server error" });
}
});


router.get("/:id", async (req, res) => {
try {
    if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
    }

    const db = await connectDB();
    const workout = await db.collection("workouts").findOne({
    _id: new ObjectId(req.params.id),
    });

    if (!workout) {
    return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json(workout);
} catch {
    res.status(500).json({ error: "Server error" });
}
});


router.post("/", auth, async (req, res) => {
try {
    const { exercise, duration, calories, date, intensity, muscleGroup, notes } = req.body;

    if (!exercise || !duration || !calories || !date || !intensity || !muscleGroup) {
    return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate data types and values
    if (typeof duration !== "number" || duration <= 0) {
      return res.status(400).json({ message: "Duration must be positive number" });
    }
    if (typeof calories !== "number" || calories < 0) {
      return res.status(400).json({ message: "Calories must be non-negative number" });
    }
    if (!["Low", "Medium", "High"].includes(intensity)) {
      return res.status(400).json({ message: "Intensity must be Low, Medium, or High" });
    }

    const db = await connectDB();
    await db.collection("workouts").insertOne({
    exercise,
    duration,
    calories,
    date,
    intensity,
    muscleGroup,
    notes: notes || "",
    userId: req.session.userId,
    createdAt: new Date(), 
    updatedAt: new Date(), 
    });

    res.status(201).json({ message: "Workout created" });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
}
});


router.put("/:id", auth, async (req, res) => {
try {
    if (!ObjectId.isValid(req.params.id)) {
return res.status(400).json({ message: "Invalid ID" });
    }

    const db = await connectDB();
    const result = await db.collection("workouts").updateOne(
    { _id: new ObjectId(req.params.id) },
    { 
        $set: { 
        ...req.body,
        updatedAt: new Date()  
        } 
    }
    );

    if (result.matchedCount === 0) {
    return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json({ message: "Workout updated" });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
}
});



router.delete("/:id", auth, async (req, res) => {
try {
    if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
    }

    const db = await connectDB();
    const result = await db.collection("workouts").deleteOne({
    _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted" });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
}
});

module.exports = router;

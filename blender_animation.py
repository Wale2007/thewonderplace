import bpy
import math
import random

# 1. Clear existing objects in the scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Ensure the scene has a rigid body world
if bpy.context.scene.rigidbody_world is None:
    bpy.ops.rigidbody.world_add()

# 2. Create the Plate
bpy.ops.mesh.primitive_cylinder_add(radius=2.5, depth=0.1, location=(0, 0, 0))
plate = bpy.context.active_object
plate.name = "Plate"

# Make the plate a passive rigid body (so it collides but doesn't fall)
bpy.ops.rigidbody.object_add()
plate.rigid_body.type = 'PASSIVE'
plate.rigid_body.collision_shape = 'MESH'
# Set kinematic to True so it follows our rotation keyframes instead of physics forces
plate.rigid_body.kinematic = True 
plate.rigid_body.restitution = 0.2  # Slight bounciness
plate.rigid_body.friction = 0.8     # High friction so ingredients don't slide off easily

# Store default interpolation and set to LINEAR
try:
    old_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'
except AttributeError:
    # Fallback if the preferences path is different
    pass

# Animate the plate rotating 360 degrees over 120 frames
plate.rotation_euler = (0, 0, 0)
plate.keyframe_insert(data_path="rotation_euler", frame=1)
plate.rotation_euler = (0, 0, 2 * math.pi)
plate.keyframe_insert(data_path="rotation_euler", frame=120)

# Restore default interpolation
try:
    bpy.context.preferences.edit.keyframe_new_interpolation_type = old_interp
except NameError:
    pass

# 3. Materials
def create_material(name, color, roughness=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
    return mat

plate_mat = create_material("PlateMat", (0.9, 0.9, 0.9, 1.0), 0.2)
plate.data.materials.append(plate_mat)

mat_tomato = create_material("TomatoMat", (0.8, 0.05, 0.05, 1.0), 0.3)
mat_veggie = create_material("VeggieMat", (0.1, 0.6, 0.1, 1.0), 0.6)
mat_meat = create_material("MeatMat", (0.4, 0.15, 0.05, 1.0), 0.8)
mat_potato = create_material("PotatoMat", (0.8, 0.7, 0.3, 1.0), 0.7)

ingredient_mats = [mat_tomato, mat_veggie, mat_meat, mat_potato]

# 4. Add falling ingredients
for i in range(25):
    x = random.uniform(-1.5, 1.5)
    y = random.uniform(-1.5, 1.5)
    z = random.uniform(3, 10)  # Drop from different heights
    
    # Randomly pick a shape: sphere, cube, or icosphere
    shape_choice = random.randint(1, 3)
    if shape_choice == 1:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.25, location=(x, y, z))
    elif shape_choice == 2:
        bpy.ops.mesh.primitive_cube_add(size=0.4, location=(x, y, z))
    else:
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.25, subdivisions=2, location=(x, y, z))
        
    obj = bpy.context.active_object
    obj.name = f"Ingredient_{i}"
    
    # Add active rigid body for gravity
    bpy.ops.rigidbody.object_add()
    obj.rigid_body.type = 'ACTIVE'
    obj.rigid_body.mass = random.uniform(0.1, 0.5)
    obj.rigid_body.restitution = 0.3  # Bounciness
    
    # Assign a random color material
    obj.data.materials.append(random.choice(ingredient_mats))
    
    # Shade smooth
    bpy.ops.object.shade_smooth()

# 5. Lighting
bpy.ops.object.light_add(type='SUN', align='WORLD', location=(5, 5, 10))
sun = bpy.context.active_object
sun.data.energy = 3
sun.data.angle = math.radians(10) # Soft shadows

bpy.ops.object.light_add(type='AREA', align='WORLD', location=(-5, -5, 5))
fill = bpy.context.active_object
fill.data.energy = 200
fill.data.size = 5

# 6. Camera
bpy.ops.object.camera_add(location=(0, -7.5, 4.5), rotation=(math.radians(60), 0, 0))
camera = bpy.context.active_object
bpy.context.scene.camera = camera

# 7. Render Settings
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 120
scene.render.fps = 30
scene.render.engine = 'BLENDER_EEVEE_NEXT'  # Use EEVEE for very fast rendering

scene.render.resolution_x = 1080
scene.render.resolution_y = 1080

print("Scene generated successfully! Press Spacebar in Blender to play the animation.")

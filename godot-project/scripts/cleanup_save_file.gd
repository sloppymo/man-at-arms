extends SceneTree

func _init() -> void:
	var err := DirAccess.remove_absolute("user://savegame.json")
	print("CleanupSaveFile: remove savegame.json err=", err)
	quit(0)

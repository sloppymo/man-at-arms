extends RefCounted

const LOG_PREFIX: String = "[Runtime]"

static func debug(message: String) -> void:
	if not OS.is_debug_build():
		return
	print("%s [DEBUG] %s" % [LOG_PREFIX, message])

static func info(message: String) -> void:
	print("%s [INFO] %s" % [LOG_PREFIX, message])

static func warn(message: String) -> void:
	push_warning("%s [WARN] %s" % [LOG_PREFIX, message])

static func error(message: String) -> void:
	push_error("%s [ERROR] %s" % [LOG_PREFIX, message])

# Returns list of counters with the services they are associated with
- GET counters
	return [{ counterId, [serviceId1, ...] }, ...]

# Create a new counter (as administrator)
- POST counters params: counterId, array(serviceId)
	return { success:TRUE/FALSE, counterId, [serviceId1, ...] }

# Modify a counter (as administrator)
- PATCH counters params: counterId, array(serviceId)
	return  { success:TRUE/FALSE, counterId, [serviceId1, ...] }

# Request new ticket to service (as customer)
- POST ticket params: serviceId
	return { success:TRUE/FALSE, ticketId, displayId, serviceId, queueLength }

# Get ticket from queue to serve (as counter officer)
- GET ticket?toserve&counterId=123
	- return { ticketId, displayId, serviceId }

# Get list of tickets served (as public screen)
- GET ticket?served[&count=123]
	return [{ ticketId, displayId, counterId, serviceId, queueLength }, ...]

# Get list of the available services
- GET services
	return [{ serviceId, serviceName, expectedSeconds}]
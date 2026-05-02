import prisma from '../config/prismaClient.js';

export const checkTicketExists = async (req, res, next) => {
    try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { ticketId: id },
      include: { images: true }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    req.ticket = ticket; 
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching ticket data", error: error.message });
  }
};  

export const checkTicketOwner = (req, res, next) => {
  const userId = req.user.userId
  if (req.ticket.userId !== userId) {
    return res.status(403).json({ success: false, message: "You do not have permission to manage this ticket." });
  }
  next();
};

export const checkTicketStatus = (allowedStatuses) => {
    return (req, res, next) => {
        if (!allowedStatuses.includes(req.ticket.ticketStatus)) {
            return res.status(403).json({ success: false, message: "Invalid ticket status." });
        }
        next();
    };
};
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Definition for locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  cep: text("cep"),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  isOrigin: boolean("is_origin").default(false),
});

export const insertLocationSchema = createInsertSchema(locations).omit({ 
  id: true,
  isOrigin: true 
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Definition for routes
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name"),
  vehicleType: text("vehicle_type").notNull(),
  totalDistance: integer("total_distance"), // in meters
  totalDuration: integer("total_duration"), // in seconds
  tollCost: integer("toll_cost"), // in cents
  fuelCost: integer("fuel_cost"), // in cents
  waypoints: jsonb("waypoints").notNull(), // array of location IDs in order
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true
});

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

// Definition for vehicle types
export const vehicleTypes = pgTable("vehicle_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().unique(), // car, motorcycle, truck1, truck2
  fuelEfficiency: integer("fuel_efficiency").notNull(), // km/liter * 10 (for precision)
  tollMultiplier: integer("toll_multiplier").notNull(), // percentage multiplier for toll costs (100 = normal)
});

export const insertVehicleTypeSchema = createInsertSchema(vehicleTypes).omit({
  id: true
});

export type InsertVehicleType = z.infer<typeof insertVehicleTypeSchema>;
export type VehicleType = typeof vehicleTypes.$inferSelect;

// Definition for points of interest (tolls, weighing stations)
export const pointsOfInterest = pgTable("points_of_interest", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // toll, weighing_station
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  cost: integer("cost"), // cost in cents, applicable for tolls
  restrictions: text("restrictions"), // any restrictions for the POI
  roadName: text("road_name"), // name of the road or highway
});

export const insertPointOfInterestSchema = createInsertSchema(pointsOfInterest).omit({
  id: true
});

export type InsertPointOfInterest = z.infer<typeof insertPointOfInterestSchema>;
export type PointOfInterest = typeof pointsOfInterest.$inferSelect;

// Definition for city events
export const cityEvents = pgTable("city_events", {
  id: serial("id").primaryKey(),
  cityName: text("city_name").notNull(),
  eventName: text("event_name").notNull(),
  eventType: text("event_type").notNull(), // holiday, festival, anniversary
  startDate: text("start_date").notNull(), // YYYY-MM-DD format
  endDate: text("end_date").notNull(), // YYYY-MM-DD format
  description: text("description"),
});

export const insertCityEventSchema = createInsertSchema(cityEvents).omit({
  id: true
});

export type InsertCityEvent = z.infer<typeof insertCityEventSchema>;
export type CityEvent = typeof cityEvents.$inferSelect;

// Definition for truck restrictions
export const truckRestrictions = pgTable("truck_restrictions", {
  id: serial("id").primaryKey(),
  cityName: text("city_name").notNull(),
  restriction: text("restriction").notNull(), // e.g., "Centro da cidade"
  startTime: text("start_time"), // HH:MM format
  endTime: text("end_time"), // HH:MM format
  applicableVehicles: text("applicable_vehicles").notNull(), // e.g., "Acima de 1 eixo"
  description: text("description"),
});

export const insertTruckRestrictionSchema = createInsertSchema(truckRestrictions).omit({
  id: true
});

export type InsertTruckRestriction = z.infer<typeof insertTruckRestrictionSchema>;
export type TruckRestriction = typeof truckRestrictions.$inferSelect;

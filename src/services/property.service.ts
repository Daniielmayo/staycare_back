import { PropertyRepository, type PropertyInsertInput, type IPropertyRow } from "../repositories/property.repository";
import { ClientProfileRepository } from "../repositories/clientProfile.repository";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import { duplicateEntryMessage } from "../utils/mysqlErrors";

export class PropertyService {
  static async listByUserId(userId: number): Promise<IPropertyRow[]> {
    const cpId = await this.getClientProfileIdForClientUserOrThrow(userId);
    return await PropertyRepository.listByClientProfileId(cpId);
  }

  static async getById(id: number, userId?: number): Promise<IPropertyRow> {
    const prop = await PropertyRepository.findById(id);
    if (!prop) throw new AppError("Property not found", 404);
    
    if (userId) {
      const cpId = await this.getClientProfileIdForClientUserOrThrow(userId);
      if (prop.client_profile_id !== cpId) {
        throw new AppError("Forbidden", 403);
      }
    }
    return prop;
  }

  static async addPropertyForClientUser(
    userId: number,
    input: Omit<PropertyInsertInput, "client_profile_id">
  ): Promise<IPropertyRow | null> {
    const cpId = await this.getClientProfileIdForClientUserOrThrow(userId);
    
    // Check for duplicates by lat/lng
    if (input.lat !== undefined && input.lng !== undefined && input.lat !== null && input.lng !== null) {
      const existing = await PropertyRepository.findByLatLng(cpId, input.lat, input.lng);
      if (existing) {
        throw new AppError("Ya existe una sede con estas coordenadas para este cliente", 409);
      }
    }

    try {
      const row: PropertyInsertInput = {
        client_profile_id: cpId,
        ...input,
      };
      const id = await PropertyRepository.insert(null, row);
      return await PropertyRepository.findById(id);
    } catch (err) {
      const dup = duplicateEntryMessage(err);
      if (dup) throw new AppError(dup, 409);
      throw err;
    }
  }

  static async updateProperty(
    propertyId: number,
    data: Partial<Pick<IPropertyRow, "property_name" | "address" | "city" | "area" | "access_notes" | "lat" | "lng">>,
    userId?: number
  ): Promise<void> {
    const prop = await PropertyRepository.findById(propertyId);
    if (!prop) throw new AppError("Property not found", 404);

    if (userId) {
      const cpId = await this.getClientProfileIdForClientUserOrThrow(userId);
      if (prop.client_profile_id !== cpId) {
        throw new AppError("Forbidden", 403);
      }
    }

    // Check for duplicates by lat/lng if coordinates are changing
    const newLat = data.lat !== undefined ? data.lat : prop.lat;
    const newLng = data.lng !== undefined ? data.lng : prop.lng;

    if (newLat !== null && newLng !== null) {
      const existing = await PropertyRepository.findByLatLng(prop.client_profile_id, newLat, newLng);
      if (existing && existing.id !== propertyId) {
        throw new AppError("Ya existe una sede con estas coordenadas para este cliente", 409);
      }
    }

    await PropertyRepository.update(propertyId, data);
  }

  static async deleteProperty(propertyId: number, userId?: number): Promise<void> {
    const prop = await PropertyRepository.findById(propertyId);
    if (!prop) throw new AppError("Property not found", 404);

    if (userId) {
      const cpId = await this.getClientProfileIdForClientUserOrThrow(userId);
      if (prop.client_profile_id !== cpId) {
        throw new AppError("Forbidden", 403);
      }
    }

    await PropertyRepository.delete(propertyId);
  }

  private static async getClientProfileIdForClientUserOrThrow(userId: number): Promise<number> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    // Note: Staff can have properties if needed or not, depends on biz rules. 
    // Usually only clients have properties.
    const profile = await ClientProfileRepository.findByUserId(userId);
    if (!profile?.id) throw new AppError("No client profile for this user", 400);
    return profile.id;
  }
}

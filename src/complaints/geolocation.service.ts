import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { District, DistrictDocument } from './schemas/district.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface LocationDetails {
  district: DistrictDocument,
  formattedAddress: string;
  street: string;
  streetNumber: string;
  neighborhood: string;
}

@Injectable()
export class GeolocationService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(District.name)
    private readonly districtModel: Model<DistrictDocument>,
  ) {}

  async getLocationDetails(latitude: string, longitude: string): Promise<LocationDetails> {
    try {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      const response = await firstValueFrom(
        this.httpService.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            latlng: `${lat},${lng}`,
            key: process.env.GOOGLE_API_KEY,
          },
        }),
      );

      const results = response.data.results;
      if (!results || results.length === 0) {
        throw new Error('No results found');
      }

      const addressComponents = results[0].address_components;
      const formattedAddress = results[0].formatted_address;

      // Extraer componentes de la dirección
      const street = this.findAddressComponent(addressComponents, 'route');
      const streetNumber = this.findAddressComponent(addressComponents, 'street_number');
      const neighborhood = this.findAddressComponent(addressComponents, 'sublocality') ||
        this.findAddressComponent(addressComponents, 'neighborhood');
      const districtName = this.extractDistrictFromResults(results);

      // Crear o encontrar el distrito
      let district = await this.districtModel.findOne({ name: districtName }).exec();
      if (!district) {
        district = new this.districtModel({
          name: districtName || 'Ubicación Desconocida',
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        });
        await district.save();
      }

      return {
        district,
        formattedAddress,
        street: street || 'Calle no especificada',
        streetNumber: streetNumber || 'S/N',
        neighborhood: neighborhood || 'Zona no especificada'
      };
    } catch (error) {
      const defaultDistrict = await this.findOrCreateDefaultDistrict(
        parseFloat(latitude), 
        parseFloat(longitude)
      );

      return {
        district: defaultDistrict,
        formattedAddress: 'Dirección no disponible',
        street: 'Calle no especificada',
        streetNumber: 'S/N',
        neighborhood: 'Zona no especificada'
      };
    }
  }

  private findAddressComponent(components: any[], type: string): string | null {
    const component = components.find(comp => comp.types.includes(type));
    return component ? component.long_name : null;
  }

  private async findOrCreateDefaultDistrict(latitude: number, longitude: number): Promise<DistrictDocument> {
    const defaultDistrictName = 'Ubicación Desconocida';
    let district = await this.districtModel.findOne({ name: defaultDistrictName }).exec();

    if (!district) {
      district = new this.districtModel({ 
        name: defaultDistrictName,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      });
      await district.save();
    }

    return district;
  }


  private extractDistrictFromResults(results: any[]): string | null {
    if (!results || results.length === 0) {
      return null;
    }

    // Buscar primero el componente de tipo 'locality'
    const districtResult = results.find((result) => 
      result.types.includes('locality') && result.types.includes('political')
    );

    if (districtResult) {
      const districtComponent = districtResult.address_components.find(
        (component) => component.types.includes('locality')
      );
      return districtComponent ? districtComponent.long_name : null;
    }

    // Si no encuentra locality, buscar el primer componente administrativo
    const adminResult = results.find((result) => 
      result.types.includes('administrative_area_level_1')
    );

    if (adminResult) {
      const adminComponent = adminResult.address_components.find(
        (component) => component.types.includes('administrative_area_level_1')
      );
      return adminComponent ? adminComponent.long_name : null;
    }

    return null;
  }
}

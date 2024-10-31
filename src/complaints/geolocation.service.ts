// geolocation.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { District, DistrictDocument } from './schemas/district.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeolocationService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(District.name)
    private readonly districtModel: Model<DistrictDocument>,
  ) {}

  async findOrCreateDistrict(latitude: number, longitude: number): Promise<DistrictDocument> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            latlng: `${latitude},${longitude}`,
            key: process.env.GOOGLE_API_KEY,
          },
        }),
      );

      const results = response.data.results;
      let districtName = this.extractDistrictFromResults(results);

      // Si no se puede obtener el nombre del distrito, usar una ubicación por defecto
      if (!districtName) {
        districtName = 'Ubicación Desconocida';
      }

      // Verificar si el distrito ya existe
      let district = await this.districtModel.findOne({ name: districtName }).exec();

      if (!district) {
        // Si el distrito no existe, créalo
        district = new this.districtModel({ 
          name: districtName,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        });
        await district.save();
      }

      return district;
    } catch (error) {
      // Si hay un error con la API de Google, crear un distrito por defecto
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

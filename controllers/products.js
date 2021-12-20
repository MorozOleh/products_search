const Product = require('../models/Product');

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({}).sort('-name');

  res.status(200).json({ products, nbHits: products.length });
};

const getAllProducts = async (req, res) => {
  const { featured, name, company, sort, select, numericFilters } = req.query;

  const queryObject = {};

  if (featured) {
    //? if the featured is true, the boolean is true either false
    queryObject.featured = featured === 'true' ? true : false;
  }

  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }

  if (company) {
    queryObject.company = company;
  }

  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };

    const regEx = /\b(<|>|>=|=|<=)\b/g;

    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );

    console.log('filters:', filters);
    const options = ['rating', 'price'];
    filters.split(',').forEach((filter) => {
      const [field, operator, value] = filter.split('-');

      if (options.includes(field)) {
        queryObject[field] = {
          ...queryObject[field],
          [operator]: Number(value),
        };
      }
    });
  }

  let result = Product.find(queryObject);
  if (sort) {
    const sortList = sort.split(',').join(' ');

    result = result.sort(sortList);
  }
  if (select) {
    const selectList = select.split(',').join(' ');

    result = result.select(selectList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await result.skip(skip).limit(limit);
  res.status(200).json({ products, nbHits: products.length });
};

module.exports = { getAllProducts, getAllProductsStatic };

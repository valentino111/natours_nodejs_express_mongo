class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log(
      '\n',
      'req.query: ',
      this.queryString,
      '\n',
      'queryObj: ',
      queryObj
    );

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log('\n', 'queryStr: ', JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // console.log('\n', 'req.query.sort: ', this.queryString.sort);
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log('\n', 'sortBy: ', sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createsAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // console.log('\n', 'req.query.fields: ', this.queryString.fields);
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=2&limit=10, 1-10 page 1, 11-20 page 2
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
